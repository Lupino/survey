window.addEvent('domready', function(){
    var score = null;
    var choose = null;

    var pop_action = null;

    $$('div.radio>input[name=score]').each(function(input){
        input.addEvent('click', function(){
            score = input.value;
            if(input.value<7){
                $('q1').tween('display', 'block');
                $('q2').tween('display', 'none');
                $('q3').tween('display', 'none');
            }else if(input.value<9){
                $('q1').tween('display', 'none');
                $('q2').tween('display', 'block');
                $('q3').tween('display', 'none');
            }else{
                $('q1').tween('display', 'none');
                $('q2').tween('display', 'none');
                $('q3').tween('display', 'block');
            }
        });
    });
    $$('div.contact>input[name=choose]').each(function(input){
        input.addEvent('click', function(){
            choose = input.value;
            if(input.value=='true'){
                $('contact').tween('display', 'inline-block');
            }else{
                $('contact').tween('display', 'none');
            }
        });
    });
    $("btn-submit").addEvent('click', function(){
        console.log(score);
        if(!score){
            $('pop-message').innerHTML='<p>请选择对XXX的满意度。</p>';
            $('pop-outer').tween('display', 'block');
            return;
        }
        if(score < 7){
            anwser = $$('textarea[name=q1]')[0].value
        }else if(score < 9){
            anwser = $$('textarea[name=q2]')[0].value
        }else{
            anwser = $$('textarea[name=q3]')[0].value
        }
        if(!anwser||anwser.length<5){
            $('pop-message').innerHTML='<p>i请填写反馈意见。</p>';
            $('pop-outer').tween('display', 'block');
            return;
        }
        var contact = null;
        if(choose){
            if(choose=='true'){
                contact = $('contact').value;
                if(!contact||contact.length < 5){
                    $('pop-message').innerHTML='<p>请填写你的联系方式。</p>';
                    $('pop-outer').tween('display', 'block');
                    return;
                }
            }
        }else{
            $('pop-message').innerHTML='<p>请选择是否留下联系方式。</p>';
            $('pop-outer').tween('display', 'block');
            return;
        }
        var req = new Request.JSON({
            url: '/api/anwsers',
            method: 'post',
            data: {
                score: score,
                anwser: anwser,
                choose: choose,
                contact: contact
            },
            onComplete: function(response){
                $('pop-message').innerHTML='<p>感谢你的反馈和建议，<a href="http://huaban.com">去花瓣逛逛</a></p>';
                $('pop-outer').tween('display', 'block');
                console.log(response);
                pop_action = function(){
                    window.location.href = "http://huaban.com";
                }
            }
        });

        req.send();
    });
    $('pop-close').addEvent('click', function(){
        $('pop-outer').tween('display', 'none');
        if(pop_action){
            pop_action();
            pop_action = null;
        }
    });
});
