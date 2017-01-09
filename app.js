function startApp(){
    sessionStorage.clear();
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_Hygz9Wt4l";
    const kinveyAppSecret ="1abc0d0fcf16498d93ef6f69af741752";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };





    $('.useronly').hide();
    $("#loadingBox").hide();
    $("#infoBox").hide();
    $("#errorBox").hide();

    $("#errorBox").on('click',function () {
        $(this).fadeOut();
    })

    $('section').hide();
    $('#viewAppHome').show();

    $('#linkMenuAppHome').on('click', function () {
        $('section').hide();
        $('#viewAppHome').show();
    })
    $('#linkMenuLogin').on('click', function () {
        $('section').hide();
        $('#viewLogin').show();
    })
    $('#linkMenuRegister').on('click', function () {
        $('section').hide();
        $('#viewRegister').show();
    })
    $('#linkMenuUserHome').on('click', function () {
        $('section').hide();
        $('#viewUserHome').show();
    })
    $('#linkMenuShop').on('click', function () {
        showShop();
        $('section').hide();
        $('#viewShop').show();
    })
    $('#linkMenuCart').on('click', function () {
        showCart();
        $('section').hide();
        $('#viewCart').show();
    })
    $('#linkMenuLogout').on('click', function () {
        $('section').hide();
        $('#viewAppHome').show();
    })

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();}, 3000);
    }

    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON && response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }
////////////////////LOGOUT

    $('#linkMenuLogout').on('click',function () {
        sessionStorage.clear();
        $('section').hide();
        $('#viewAppHome').show();
        $('.useronly').hide();
        $('.anonymous').show();
        $('#spanMenuLoggedInUser').text('');
        showInfo("User successfully logged out.")

    })

////////////////////REGISTER
    $('#formRegister').on('submit',function () {
        event.preventDefault();
        let username = $('#registerUsername').val();
        let password = $('#registerPasswd').val();
        let fullName = $('#registerName').val();

        let userData = {
            "username":username,
            "password":password,
            "name":fullName
        }

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: registerSuccess,
            error: handleAjaxError
        })


    })
    
    function registerSuccess(data) {
        sessionStorage.setItem('username',data.username);

        sessionStorage.setItem('password',data.password);
        sessionStorage.setItem('name',data.name);
        sessionStorage.setItem('id',data._id);
        showInfo("User registration successful.");
        loginAfterReg();
        function loginAfterReg(){
            let loginData = {
                'username':sessionStorage.getItem('username'),
                'password':sessionStorage.getItem('password')
            }
            $.ajax({
                method:"POST",
                url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
                headers: kinveyAppAuthHeaders,
                data: loginData,
                success: loginSuccess,
                error: handleAjaxError
            })
        }
    }








/////////////////LOGIN
    $('#formLogin').on('submit',function () {
        event.preventDefault();
        let username = $('#loginUsername').val();
        let password = $('#loginPasswd').val();
        let loginData = {
            'username':username,
            'password':password
        }
        $.ajax({
            method:"POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: loginData,
            success: loginSuccess,
            error: handleAjaxError
        })

    })
    function loginSuccess(data) {
        sessionStorage.clear();
        sessionStorage.setItem('username',data.username);
        sessionStorage.setItem('name', data.name);
        sessionStorage.setItem('id',data._id);
        sessionStorage.setItem('authtoken',data._kmd.authtoken)

        $('.anonymous').hide();
        $('.useronly').show();

        showInfo("User login successful.");

        $('section').hide();
        $('#viewUserHomeHeading').text('Welcome, '+sessionStorage.getItem('name'))
        $('#spanMenuLoggedInUser').text("Welcome, " +sessionStorage.getItem('name'));
        $('#viewUserHome').show();





    }

    function showShop(){
        showInfo("Shop loaded successful.");
        $('section').hide();
        $('#viewShop').show();
        $.ajax({
            method:"GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/products",
            headers: getKinveyUserAuthHeaders(),
            success: loadProductsSuccess,
            error: handleAjaxError
        })
    }

    $('#linkUserHomeShop').on('click',function () {

        showShop()
    })

    function loadProductsSuccess(data) {
        $("#shopProducts > table > tbody").empty();
        for(let product of data){
            let tr = $('<tr>');
            tr.attr('id',product._id);
            let productTd = $('<td>');
            productTd.text(product.name)
            productTd.appendTo(tr);
            let descTd = $('<td>');
            descTd.text(product.description);
            descTd.appendTo(tr)
            let priceTd = $('<td>');
            priceTd.text(Math.round(Number(product.price)).toFixed(2))
            priceTd.appendTo(tr);
            
            let actionTd = $('<td>');
            let purchaseBtn = $('<button>');
            purchaseBtn.text("Purchase");
            purchaseBtn.appendTo(actionTd);
            purchaseBtn.attr('class',product._id)
            purchaseBtn.on('click',function (event) {
               let productToAddId = event.target.className;
                $.ajax({
                    method:"GET",
                    url: kinveyBaseUrl + "user/" + kinveyAppKey + "/" +sessionStorage.getItem('id'),
                    headers: getKinveyUserAuthHeaders(),
                    success: loadUserCart,
                    error: handleAjaxError
                })
                function loadUserCart(data) {
                    if(data["cart"]){
                        if(data['cart'][productToAddId]){
                            let quantity = Number(data['cart'][productToAddId].quantity)+1;
                            data['cart'][productToAddId].quantity = quantity;
                        }
                        else{
                            data['cart'][productToAddId]=
                                {
                                    "quantity":'1',
                                    "product":{
                                        "name":$('#'+productToAddId)[0].children[0].innerText,
                                        "description":$('#'+productToAddId)[0].children[1].innerText,
                                        "price":$('#'+productToAddId)[0].children[2].innerText,
                                    }
                                }
                        }
                    }
                    else{
						data["cart"] = {};
                        data["cart"][productToAddId] =
                            {
                                "quantity":'1',
                                "product":{
                                    "name":$('#'+productToAddId)[0].children[0].innerText,
                                    "description":$('#'+productToAddId)[0].children[1].innerText,
                                    "price":$('#'+productToAddId)[0].children[2].innerText,
                                }
                            }
                    }

                    $.ajax({
                        method:"PUT",
                        url: kinveyBaseUrl + "user/" + kinveyAppKey + "/" +sessionStorage.getItem('id'),
                        headers: getKinveyUserAuthHeaders(),
                        data: data,
                        success: productAddSuccess,
                        error: handleAjaxError
                    })

                }
                function productAddSuccess() {
                    showInfo("Product added successfully")
                }
            })



            actionTd.appendTo(tr);
            
            tr.appendTo($("#shopProducts > table > tbody"))
        }
    }

    function showCart(){
        showInfo("Cart loaded successful.");

        $('section').hide();
        $('#viewCart').show();

        $.ajax({
            method:"GET",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/" +sessionStorage.getItem('id'),
            headers: getKinveyUserAuthHeaders(),
            success: loadCartSuccess,
            error: handleAjaxError
        })

    };

    function loadCartSuccess(data) {
        $("#cartProducts > table > tbody").empty();
        let cart = data.cart;
        $.each(cart,function(index,el) {
            let tr= $('<tr>');
            tr.attr('id',index);

            let productTd = $('<td>');
            productTd.text(el.product.name);
            productTd.appendTo(tr);

            let desctTd = $('<td>');
            desctTd.text(el.product.description);
            desctTd.appendTo(tr)

            let quantityTd = $('<td>');
            quantityTd.text(el.quantity);
            quantityTd.appendTo(tr)

            let priceTd = $('<td>');
            priceTd.text((Number(el.product.price)*Number(el.quantity)).toFixed(2));
            priceTd.appendTo(tr)

            let actionTd = $('<td>');
            let discardBtn = $('<button>');
            discardBtn.text("Discard");
            discardBtn.attr('class', index)
            discardBtn.appendTo(actionTd);

            discardBtn.on('click',function(index){
                let discardedProduct = index;
                $.ajax({
                    method:"GET",
                    url: kinveyBaseUrl + "user/" + kinveyAppKey + "/" +sessionStorage.getItem('id'),
                    headers: getKinveyUserAuthHeaders(),
                    success: discardProduct(data,event),
                    error: handleAjaxError
                })
                function discardProduct(data,event) {
                    let cart = data.cart;
                    let elementToChange = event.target.className;
                    data.cart[elementToChange].quantity-=1;
                    if(data.cart[elementToChange].quantity==0)
                        delete data.cart[elementToChange];
                    $.ajax({
                        method:"PUT",
                        url: kinveyBaseUrl + "user/" + kinveyAppKey + "/" +sessionStorage.getItem('id'),
                        headers: getKinveyUserAuthHeaders(),
                        data: data,
                        success: discardSuccess,
                        error: handleAjaxError
                    })
                }
            })
            actionTd.appendTo(tr);

            tr.appendTo($("#cartProducts > table > tbody"))

        })
        function discardSuccess(data) {
            showInfo("Item discarded successfully.");

            $('section').hide();
            $('#viewCart').show();

            $.ajax({
                method:"GET",
                url: kinveyBaseUrl + "user/" + kinveyAppKey + "/" +sessionStorage.getItem('id'),
                headers: getKinveyUserAuthHeaders(),
                success: loadCartSuccess,
                error: handleAjaxError
            })
        }


    }

    $('#linkUserHomeCart').on('click',function(){
        showCart()
    })
    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')
        };


    }

}