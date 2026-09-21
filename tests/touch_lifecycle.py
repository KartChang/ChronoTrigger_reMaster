"""Test-owned browser retirement and navigation observations, never game state writes."""
import time


def live_pages(browser):
    return [page for context in browser.contexts for page in context.pages if not page.is_closed()]


def retire_desktop(browser, page, report):
    """Close only the completed test's context, before a new GPU scene is created."""
    context = page.context
    report.update(status='retiring', contextsBefore=len(browser.contexts), pagesBefore=len(live_pages(browser)))
    assert list(browser.contexts) == [context] and live_pages(browser) == [page], report
    context.close()
    report.update(contextsAfter=len(browser.contexts), pagesAfter=len(live_pages(browser)), desktopClosed=page.is_closed())
    assert report['desktopClosed'] and report['contextsAfter'] == 0 and report['pagesAfter'] == 0, report
    report['status'] = 'passed'


def require_empty_browser(browser):
    observed = {'contexts': len(browser.contexts), 'pages': len(live_pages(browser))}
    assert observed == {'contexts': 0, 'pages': 0}, observed
    return observed


class NavigationProbe:
    """Observe load milestones without changing wait semantics or retrying navigation."""
    def __init__(self, page):
        self.started = time.monotonic()
        self.data = {'waitUntil': 'load', 'timeoutMs': 30000, 'status': 'not-started',
                     'events': [], 'requests': 0, 'finished': 0, 'failed': []}
        page.on('domcontentloaded', lambda: self.event('domcontentloaded'))
        page.on('load', lambda: self.event('load'))
        page.on('request', self.request)
        page.on('requestfinished', self.finished)
        page.on('requestfailed', self.failed)

    def elapsed(self):
        return round((time.monotonic() - self.started) * 1000, 2)

    def event(self, name):
        self.data['events'].append({'event': name, 'elapsedMs': self.elapsed()})

    def request(self, request):
        self.data['requests'] += 1

    def finished(self, request):
        self.data['finished'] += 1

    def failed(self, request):
        self.data['failed'].append({'type': request.resource_type, 'failure': request.failure})

    def goto(self, page, url):
        self.data.update(status='loading', url=url)
        try:
            response = page.goto(url, wait_until='load', timeout=30000)
            self.data.update(status='loaded', httpStatus=response.status if response else None)
            assert response is not None and response.status == 200, self.data
        except Exception as exc:
            self.data.update(status='failed', failure=str(exc))
            raise
        finally:
            self.data['elapsedMs'] = self.elapsed()


def navigation_snapshot(page):
    return page.evaluate('''() => {
      const n=performance.getEntriesByType('navigation')[0];
      return {url:location.href,readyState:document.readyState,focused:document.activeElement?.id,
        visibility:document.visibilityState,hook:!!window.__CHRONO_TEST__,
        startDisabled:document.querySelector('#start-story')?.disabled,
        timing:n?{responseStart:n.responseStart,responseEnd:n.responseEnd,
          domContentLoadedEventEnd:n.domContentLoadedEventEnd,loadEventEnd:n.loadEventEnd}:null};
    }''')
