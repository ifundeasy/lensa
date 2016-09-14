$(document).ready(function () {
    var collection = $("#tableName");
    App.models.forEach(function (model) {
        var el = toTitleCase(splitCamelCase(model));
        collection.append('<option value="'+ el +'">'+ el +'</option>');
    })
    collection.chosen({no_results_text : "Oops, nothing found!", width : "100%"});
    $('.dataTables-example').DataTable({
        pageLength : 25,
        responsive : true,
        dom : '<"html5buttons"B>lTfgitp',
        buttons : [
            {extend : 'copy'},
            {extend : 'csv'},
            {extend : 'excel', title : 'ExampleFile'},
            {extend : 'pdf', title : 'ExampleFile'},
            {
                extend : 'print',
                customize : function (win) {
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                    .addClass('compact')
                    .css('font-size', 'inherit');
                }
            }
        ]
    });
})