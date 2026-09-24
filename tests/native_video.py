"""Public Playwright video of the existing page; no extra journey or game-state writes.
The full CPU session is retained. Host monotonic timestamps locate the route only
approximately: encoder start offset is not asserted to be frame-exact. No audio claim.
"""
import hashlib
import time
from pathlib import Path


def video_options(out):
    return dict(record_video_dir=str(Path(out)/'.native-video'),
                record_video_size={'width':960,'height':844})


def begin_native_video(identity):
    return dict(schema='chrono-native-video-v1', status='recording', **identity,
                method='public-playwright-context-video', originUs=time.monotonic_ns()//1000,
                size={'width':960,'height':844}, physicalDevice=False, artApproved=False,
                audioRecorded=False, frameExactAlignment=False)


def retain_native_video(page, out, record):
    # context.close() must have completed so the original WebM is fully flushed.
    try:
        path=Path(out)/'era600'/'native-session.webm';path.parent.mkdir(parents=True,exist_ok=True)
        if page.video is None: raise AssertionError('Native video was not enabled')
        page.video.save_as(str(path))
        raw=path.read_bytes()
        assert len(raw)>1024 and raw[:4]==bytes.fromhex('1a45dfa3'), 'Missing complete WebM'
        record.update(status='retained', endUs=time.monotonic_ns()//1000, closedContext=True,
                      relativeTo='cpu-renderer/era600', path=path.name, bytes=len(raw),
                      sha256=hashlib.sha256(raw).hexdigest())
        # Delete only the redundant staging recording, never the retained original bytes.
        page.video.delete()
    except Exception as exc:
        record.update(status='failed', error={'type':type(exc).__name__,'message':str(exc)})
        raise
