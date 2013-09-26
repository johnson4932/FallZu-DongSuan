(function($){
    $('#alertMessage').hide();

    //createVoteModal
    $('#createVoteModal .submit').click(function() {
        $.post('/api/createVote', $('#createVoteModal form').serialize())
        .done(function(data) {
            $('#createVoteModal').modal('hide');
            var Status = (true == data.Success) ? ('success') : ('danger');
            $('#alertMessage').html(data.Message).attr('class','alert alert-' + Status).show();
            window.location.href = window.location.toString();
        })
        .fail(function(err) {
            $('#createVoteModal').modal('hide');
            $('#alertMessage').html('Please Login').attr('class','alert alert-danger').show();
        });
    });

    //createAdminModal
    $('#createAdminModal .submit').click(function() {
        $.post('/api/createAdmin', $('#createAdminModal form').serialize())
        .done(function(data) {
            $('#createAdminModal').modal('hide');
            var Status = (true == data.Success) ? ('success') : ('danger');
            $('#alertMessage').html(data.Message).attr('class','alert alert-' + Status).show();
        })
        .fail(function(err) {
            $('#createAdminModal').modal('hide');
            $('#alertMessage').html('Please Login').attr('class','alert alert-danger').show();
        });
    });

})(jQuery);
