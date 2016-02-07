var Flow = require('seq'),
    util = require('underscore');

module.exports = function(app, survey) {

function send_json_response(res, err, data) {
    if (err) {
        res.json({error: err});
    }
    else {
        res.json(data)
    }
}

app.get('/api/anwsers/:type', function(req, res){
    survey.get_anwsers(req.params.type, function(err, anwsers){
        anwsers = anwsers || [];
        send_json_response(res, err, anwsers);
    });
});

app.post('/api/anwsers', function(req, res){
    var anwser = req.body;
    anwser.score = Number(anwser.score);
    survey.save_anwser(anwser, function(err, result){
        send_json_response(res, err, result);
    });
});

app.delete('/api/anwsers/:id', function(req, res){
    var anwser_id = Number(req.params.id);
    survey.del_anwser(anwser_id, function(err, ok){
        send_json_response(res, err, {id: anwser_id});
    });
});

app.get('/api/nps', function(req, res){
    survey.get_nps(function(err, nps){
        nps = nps || {};
        send_json_response(res, err, nps);
    });
});

};
