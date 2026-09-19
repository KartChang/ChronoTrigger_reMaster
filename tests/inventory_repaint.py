"""Read-only live DOM measurements for merchant repaint, never scroll/state setters."""
import math


def measure_merchant_repaint(page):
    return page.evaluate('''()=>{
      const body=document.querySelector('#inventory-content'),panel=document.querySelector('#equipment-panel');
      const row=document.querySelector('#equipment-shop-row-bronze-helm');
      const rect=e=>e.getBoundingClientRect().toJSON();
      return {scrollTop:body.scrollTop,scrollHeight:body.scrollHeight,clientHeight:body.clientHeight,
        content:rect(body),panel:rect(panel),row:rect(row),focused:document.activeElement?.id,
        options:[...panel.querySelectorAll('.equipment-slot button')].map(b=>({id:b.id,owned:b.dataset.owned,disabled:b.disabled})),
        actions:[...panel.querySelectorAll('.equipment-shop-row button')].map(b=>({id:b.id,disabled:b.disabled,rect:rect(b),text:b.innerText})),
        overflowAnchor:getComputedStyle(body).overflowAnchor};
    }''')


def assert_merchant_repaint(before, after):
    """Keep the numeric scroll contract and visible row, not just focus ownership."""
    for sample in (before, after):
        for key in ('scrollTop', 'scrollHeight', 'clientHeight'):
            assert isinstance(sample[key], (int, float)) and not isinstance(sample[key], bool) and math.isfinite(sample[key]), sample
        assert 0 <= sample['scrollTop'] <= sample['scrollHeight'] - sample['clientHeight'] + 1, sample
        assert sample['clientHeight'] > 0, sample
        for rect in ('row', 'content'):
            assert all(isinstance(sample[rect][key], (int, float)) and math.isfinite(sample[rect][key]) for key in ('top', 'bottom')), sample
    assert abs(after['scrollTop'] - before['scrollTop']) <= 2, ('scroll displacement', before, after)
    assert abs(after['row']['top'] - before['row']['top']) <= 2, ('trade row displacement', before, after)
    assert before['options'] and [b['id'] for b in after['options']] == [b['id'] for b in before['options']], ('catalog changed shape', before, after)
    assert after['row']['top'] >= after['content']['top'] - 1 and after['row']['bottom'] <= after['content']['bottom'] + 1, ('trade row not fully visible', after)
    assert after['focused'] == 'equipment-shop-row-bronze-helm', after
