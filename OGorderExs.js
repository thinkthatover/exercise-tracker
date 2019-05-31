function orderExs(){

    //get divArray data
    var dArr = $('.exCont');
    var len = dArr.length;
    var pusher = dArr[len-1];
    var pushed = dArr[len-2];
    var order_num;
    var temp;

    //since new containers are pushed to back, check last div order #s to see if a reorder is necessary:
    if (pusher.className[pusher.className.length - 1] <= pushed.className[pushed.className.length - 1]){
        for (var i = 0; i < dArr.length-1; i++){
            pushed = dArr[i];

            //iterate over list, determine where order change needs to occur.
            if (pusher.className[pusher.className.length - 1] == pushed.className[pushed.className.length - 1]){

                //hotswap pusher to correct place.
                $('#' + pusher.id).insertBefore($('#' + pushed.id));

                //change order number of pushed to agree
                for (var j = 0; j < ex_array.length; j++){
                    if (ex_array[j].div_id == pushed.id.slice(6)) {
                        ex_array[j].order++;
                        order_num = ex_array[j].order;
                    }
                }

                //class & GUI elements
                $('#' + pushed.id).attr('class', 'row border rounded exCont ' + order_num);
                $('#' + pushed.id + ' .order').text('#' + order_num.toString());


                //iterate pushed to pusher for next loop
                pusher = dArr[i];
            }
        }
        //sort exercise array
        ex_array.sort(function(a, b){
            return a.order-b.order;
        });
    }