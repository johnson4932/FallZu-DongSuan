(function($){
    $('#alertMessage').hide();

    //createVoteModal
    $('#createVoteModal .submit').click(function() {
        $.post('/api/createVote', $('#createVoteModal form').serialize())
        .done(function(data) {
            $('#createVoteModal').modal('hide');
            var Status = (true == data.Success) ? ('success') : ('danger');
            $('#alertMessage').html(data.Message).attr('class','alert alert-' + Status).show();
        })
        .fail(function(err) {
            $('#createVoteModal').modal('hide');
            $('#alertMessage').html('Please Login').attr('class','alert alert-danger').show();
        });
    });

    //createGroupModal
    $('#createGroupModal .clone').click(function() {
        var check = $('#createGroupModal .clone:checked').val();
        var div = $(this).parents().find('.cloneDiv');
        (undefined == check) ? (div.hide()) : (div.show());
    });

    $('#createGroupModal .addColumn').click(function(e) {
        e.preventDefault();
        $('#createGroupModal .group-name .form-control:first')
            .clone()
            .val("")
            .appendTo('#createGroupModal .group-name');
    });

    $('#createGroupModal .submit').click(function() {
        $.post('/api/createGroup', $('#createGroupModal form').serialize())
        .done(function(data) {
            $('#createGroupModal').modal('hide');
            var Status = (true == data.Success) ? ('success') : ('danger');
            $('#alertMessage').html(data.Message).attr('class','alert alert-' + Status).show();
        })
        .fail(function(err) {
            $('#createGroupModal').modal('hide');
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
