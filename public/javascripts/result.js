function load_nps(){
    var req = new Request.JSON({
        url: '/api/nps/',
        method: 'get',
        onComplete: function(r){
            var total = r.low + r.mid + r.high;
            if(total==0){
                var nps = 100;
            }else{
                var nps = (r.high - r.low)/total * 100;
            }
            $$('#nps-benner>#total>span')[0].innerHTML = total;
            $$('#nps-benner>#nps>span')[0].innerHTML = nps + '%';
            $$('#choose-button>button.low>span')[0].innerHTML = r.low;
            $$('#choose-button>button.mid>span')[0].innerHTML = r.mid;
            $$('#choose-button>button.high>span')[0].innerHTML = r.high;
        }
    });

    req.send();
}

function load_anwsers(type){
    var th_anwser = {
        'low':'你给我们打这个分数的原因是什么？',
        'mid':'我们能做何种改进可以让你给我们的打分接近10？',
        'high':'你将怎么样向其他人介绍XXX？'
    };
    var html = "";
    html+= '<tr>';
    html+= '<th class="relname">用户名</th>';
    html+= '<th class="score">评分</th>';
    html+= '<th class="anwser">' + th_anwser[type] + '</th>';
    html+= '<th class="contact">联系方式</th>';
    html+= '<th class="handle">操作</th>';
    html+= '</tr>';
    var req = new Request.JSON({
        url: '/api/anwsers/' + type + '/',
        method: 'get',
        onComplete: function(r){
            var len = r.length;
            for(var i=0;i<len;i++){
                anwser = r[i];
                if(i%2===1){
                    html += '<tr class="r2">';
                }else{
                    html += '<tr class="r1">';
                }
                html += '<td class="relname"><a href="http://huaban.com/' + anwser['username'] + '" target="_blank">' + anwser['relname'] + '</a></td>';
                html += '<td class="score">' + anwser['score'] + '</td>';
                html += '<td class="anwser">' + anwser['anwser'] + '</td>';
                html += '<td class="contact">' + anwser['contact'] + '</td>';
                html += '<td class="handle"><a href="#" data-id="' + anwser['id'] + '" class="del">剔除</a></td>';
                html += '</tr>';
            }
            $('result').innerHTML = '<table>' + html + '</table>';
        }
    });

    req.send();

}
window.addEvent('domready', function(){
    var timer = null;
    var loop = function(timeout){
        load_nps();
        if(timer){
            clearTimeout(timer);
        }
        var timer = setTimeout(loop, 5000);
    };
    loop();
    load_anwsers('low');
    $$('#choose-button>button').each(function(btn){
        btn.addEvent('click', function(){
            var type = btn.className;
            load_anwsers(type);
        });
    });
    $('result').addEvent('click', function(evt){
        var evt = evt||window.event;
        var element = document.elementFromPoint(evt.page.x, evt.page.y);
        if(element.className='del'){
            var anwser_id = element.getAttribute('data-id');
            var req = new Request.JSON({
                url: '/api/anwsers/' + anwser_id + '/',
                method: 'DELETE',
                onComplete: function(r){
                    p = element.parentElement.parentElement;
                    p.parentElement.removeChild(p);
                    console.log(r);
                    loop();
                }
            });
            req.send();
        }

    });
});
