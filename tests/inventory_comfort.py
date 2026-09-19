"""Read-only browser geometry checks, not an art score or a device certification."""
def measure_inventory(page):
    return page.evaluate('''()=>{
      const panel=document.querySelector('.inventory-dialog'),body=document.querySelector('#inventory-content');
      const header=document.querySelector('.inventory-heading'),status=document.querySelector('#inventory-feedback');
      const rect=e=>e.getBoundingClientRect().toJSON();
      return {viewport:{width:innerWidth,height:innerHeight},panel:rect(panel),content:rect(body),
        header:rect(header),status:rect(status),hasFeedback:!!status.textContent,
        scrollTop:body.scrollTop,scrollLimit:body.scrollHeight-body.clientHeight,
        clientWidth:body.clientWidth,scrollWidth:body.scrollWidth,
        shellScrollTop:panel.scrollTop,shellClientWidth:panel.clientWidth,shellScrollWidth:panel.scrollWidth,
        coarse:matchMedia('(pointer:coarse)').matches,
        buttonHeights:[...panel.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({id:b.id,height:rect(b).height}))};
    }''')


def assert_inventory_layout(m):
    p,c,h,s,v=m['panel'],m['content'],m['header'],m['status'],m['viewport']
    assert p['top']>=0 and p['left']>=0 and p['right']<=v['width']+1 and p['bottom']<=v['height']+1,m
    assert c['top']>=h['bottom']-1 and c['bottom']<=p['bottom']+1,m
    if m['hasFeedback']:
        assert c['bottom']<=s['top']+1 and s['bottom']<=p['bottom']+1,m
    assert c['height']>=p['height']*.65,('less than 65% of the panel is available for content',m)
    assert m['scrollWidth']<=m['clientWidth']+1 and m['shellScrollWidth']<=m['shellClientWidth']+1,m
    assert abs(m['shellScrollTop'])<=1,('outer dialog must not be the scroll owner',m)
    minimum=44 if m['coarse'] else 36
    assert m['buttonHeights'] and all(b['height']>=minimum-1 for b in m['buttonHeights']),m
    return m


def assert_inventory_readability(page):
    """Observe real computed styles and semantic state, not screenshot aesthetics."""
    m=page.evaluate('''()=>{
      const style=e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,color:s.color,opacity:s.opacity};};
      const panel=document.querySelector('.inventory-dialog');
      return {panel:style(panel),current:[...panel.querySelectorAll('button[data-current="true"]')].map(b=>({id:b.id,...style(b)})),
        disabled:[...panel.querySelectorAll('#equipment-panel button:disabled')].map(b=>({id:b.id,...style(b)})),
        comparisons:panel.querySelectorAll('.equipment-comparison').length,
        buyNames:[...panel.querySelectorAll('[id^="buy-"]')].map(b=>b.getAttribute('aria-label'))};
    }''')
    assert m['panel']['background']=='rgb(32, 53, 74)' and m['panel']['opacity']=='1',m
    assert len(m['current'])>=4 and all(x['opacity']=='1' for x in m['current']),m
    assert m['disabled'] and all(x['opacity']=='1' for x in m['disabled']),m
    assert m['comparisons']==7 and len(m['buyNames'])==len(set(m['buyNames']))==7,m
    return m
