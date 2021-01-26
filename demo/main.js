// MicroShop
// - Параметры
// Общие
msBServer = false // Синхронизация с сервером
msBPage = true // Синхронизация со страницей
msBjGrowl = true // Уведомления через jGrowl
// Настройки сервера
msSServerUrl = '404.php' // Путь до обработчика на сервере
// Оформление заказа и корзина
button_cart = '.shop_cart' // Кнопка перехода в корзину
button_add = 'button[value="cart/add"]' // Кнопка добавления в корзину
button_remove = 'button[value="cart/remove"]' // Кнопка удаления из корзины
button_remove_all = 'button[value="cart/removeall"]' // Кнопка удаления из корзины
form_order = '.form_order' // Форма оформления заказа
form_order_cart = '.form_order_cart' // Корзина в Форме оформления заказа
form_order_null = '.form_order_null' // Сообщение о пустой корзине
form_order_success = '.form_order_success' // Сообщение успешной отправки
product_count = '.product_count' // Поле с количеством товара в корзине
// Карточка товара
msSProduct = '.microshop_product' // Блок товара
msSProductArt = '[name="art"]' // input Артикул товара
msSProductId = '[name="id"]' // input id товара
msSProductPrice = '.price' // класс html блока с ценой товара
msSProductCount = '[name=count]' // input с количеством товара
msSProductUrl = '[name=url]' // input с Адресом товара
msSProductImg = '.card-img-top' // img элемент картинки товара
msSProductName = '[name=name]' // input с названием товара
msSProductSize = '[name=size]' // input с размерами товара
msSProductStatus = '.cart_add_status' // блок со статусом товара (Добавлен в корзину)

// Обьект товара
function ms_product_scan( msIProductArt ){
  var msOProduct = false

  // Если есть артикул, ищем по нему
  if ( msIProductArt ) {
    // Если такой товар есть на странице, собираем данные
    if ( ! $(document).find(msSProduct).find(msSProductArt + '[value="' + msIProductArt + '"]').length ) return false

    var
    msOProductArt = $(document).find(msSProduct).find(msSProductArt + '[value="' + msIProductArt + '"]'),
    msOProductBlock = msOProductArt.parents(msSProduct)

    msOProduct = {
      art: parseFloat( msOProductBlock.find(msSProductArt).val() ),
      id: parseFloat( msOProductBlock.find(msSProductId).val() ),
      price: parseFloat( msOProductBlock.find(msSProductPrice).html() ),
      count: parseFloat( msOProductBlock.find(msSProductCount).val() ),
      url: msOProductBlock.find(msSProductUrl).val(),
      img: msOProductBlock.find(msSProductImg).attr('src'),
      name: msOProductBlock.find(msSProductName).val()
    }

    // Если есть размер
    if ( msOProductBlock.find(msSProductSize).val() ) {
      // Добавляем размер и правим артикул
      msOProduct.size = msOProductBlock.find(msSProductSize).val()
      msOProduct.art = parseFloat( msOProduct.art + '.' + msOProduct.price )
    }
    // Тоже самое на странице товара
    // !!!
    if ( msOProductBlock.find('[name^=size]:checked').val() ) {
      // Добавляем размер и правим артикул
      msOProduct.size = $('label[for='+msOProductBlock.find('[name^=size]:checked').attr('id')+']').html()
      msOProduct.art = parseFloat( msOProduct.art + '.' + msOProduct.price )
    }
  }
  return msOProduct
}

// - Пересчёт товаров
function cart_reload(msBSave) {
  if ( msBSave == void 0 ) msBSave = true

  count = 0
  sum = 0

  if (localStorage.getItem('MicroShop')) {
    msOProducts = JSON.parse(localStorage.getItem('MicroShop'))
    msOProducts = msOProducts.items

    $.each(msOProducts, function() {
      count = parseInt(count) + parseInt(this.count)
      sum = parseInt(sum + this.price * this.count)
    })

    // Если на странице корзины то и данные в форме бомбим
    if ($(document).find(form_order_cart).length > 0) {
      $(document).find('#cart_count').html(count)
      $(document).find('#cart_sum').html(sum)
    }

    // Обновляем товары в корзине если на её странице
    if ( $(document).find('#input_products').length > 0 ) {
      $(document).find('#input_products').val(JSON.stringify(msOProducts))
    }
  } else {
    // $(button_cart).hide()
    $(form_order).hide()
    $(form_order_null).show()
  }

  // Изменяем значение в мини корзине
  $(document).find(button_cart).find('.shop_cart_btn span').html(count)
  $(button_cart).show()

  if ( msBSave ) cart_save() // Сохранение результатов
}

// Обновление товаров
function cart_update(){
  // Получаем товары с сервера
  if ( msBServer ) {
    // Корзина пользователя
    $.ajax({
      url: msSServerUrl,
      method: "POST",
      data: {'MicroShop':'show'}
    }).done(function( data ) {
      if ( ! data ) return false
      msOCart = $.parseJSON( data )
      msOCartProducts = $.parseJSON( msOCart.products )
      // Если товары есть
      // Перебираем и синхронизируем товары с товарами в кэше
      $.each(msOCartProducts, function() {
        cart_product_synch( this )
      })
      cart_reload(false)
    })

    // Обновление цен
    if ( localStorage.getItem('MicroShop') ) {
      var
      msOMicroShop = $.parseJSON( localStorage.getItem('MicroShop') ),
      msOCartProducts = msOMicroShop.items

      $.ajax({
        url: msSServerUrl,
        method: "POST",
        data: {'MicroShop':'update', 'products':msOCartProducts}
      }).done(function( data ) {
        if ( ! data ) return false
        var msOCartProducts = $.parseJSON( data )
        if ( msOCartProducts ) {
          $.each(msOCartProducts, function(){
            cart_product_synch( this )
          })
        }
      })
    }
  }

  // Получаем товары со страницы
  if ( msBPage ) {
    if ( ! localStorage.getItem('MicroShop') ) return false

    var
      msOMicroShop = JSON.parse(localStorage.getItem('MicroShop')),
      msOProducts = msOMicroShop.items

    $.each(msOProducts, function() {
      // Если товар есть на странице
      if ( $(document).find('[name="shk-id"][value="' + this.art + '"]').length ) {
        // Получем его значения
        var
        form = $(document).find('[name="shk-id"][value="' + this.art + '"]').parents('form'),
        msOProduct = {
          art: parseFloat( form.find('[name="shk-id"]').val() ),
          id: parseFloat( form.find('[name="shk-id"]').val() ),
          price: parseFloat( form.find('.shk-price').html() ),
          count: parseFloat( form.find('[name=count]').val() ),
          url: form.find('[name=url]').val(),
          img: form.find('.shk-image').attr('src'),
          name: form.find('[name="shk-name"]').val()
        }
        // Синхронизируем
        cart_product_synch( msOProduct )
      }
    })

    cart_reload(false)
  }
}

// Синхронизируем товары в локальном хранилище
function cart_product_synch( msOProduct ){

  // Перебираем товары которые есть
  if ( localStorage.getItem('MicroShop') ) {
    var
    msOProducts = JSON.parse(localStorage.getItem('MicroShop')),
    // msOProducts = msOMicroShop.items,
    msBAdd = true

    $.each(msOProducts.items, function() {
      // Если нужный товар уже есть в корзине, меняем значения
      if ( msOProduct.art == this.art ) {
        if ( parseInt(this.count) != parseInt(msOProduct.count) ) this.count = parseInt(msOProduct.count)
        this.price = parseFloat(msOProduct.price)
        msBAdd = false
      }
    })

    // Если товара ещё нет в корзинет, добавляем
    if ( msBAdd ) msOProducts.items.push(msOProduct)

    // Сохраняем изменения
    // if ( msOProducts.items.length )
    localStorage.setItem('MicroShop', JSON.stringify({
      'items': msOProducts.items
    }))
  }
  else {
    localStorage.setItem('MicroShop', JSON.stringify({
      'items': [msOProduct]
    }))
  }
}

// Сохраняем коризну в базе
function cart_save(){
  if ( ! msBServer ) return false
  if (localStorage.getItem('MicroShop')){
    var
    arrMicroShop = JSON.parse(localStorage.getItem('MicroShop')),
    arrProducts = arrMicroShop.items

    if ( ! arrProducts.length ) arrProducts = ''

    $.ajax({
      url: msSServerUrl,
      method: "POST",
      data: {'MicroShop':'save','products': arrProducts }
    })
  }
  else {
    $.ajax({
      url: msSServerUrl,
      method: "POST",
      data: {'MicroShop':'save','products': '' }
    })
  }
}

// - Отправка
function order_success() {
  $(document).find(form_order).hide()
  localStorage.removeItem('MicroShop')
  $(document).find(form_order_success).show()
}

$(function() {
  // - Если на странице содержимое корзины, то выгружаем её
  if (localStorage.getItem('MicroShop') && $(document).find(form_order_cart).length > 0) {
    $(document).find('.form_order_null').hide()
    oProducts = JSON.parse(localStorage.getItem('MicroShop'))

    var
      cart_html = '',
      sum = 0,
      count = 0

    // -- Собираем товары
    cart_html += '<tbody>'
    $.each(oProducts.items, function(index, elem) {
      // old version fix
      if ( this.size_val ) this.size = this.size_val

      var
      html = '<tr>'
        html += '<td>'
          html += '<img src="' + this.img + '" alt="" width="50" height="50">'
        html += '</td>'
        html += '<td>'
          html += '<b><a href="' + this.url + '">' + this.name + '</b></a>'
        html += '</td>'
        html += '<td>'
          html += this.size ? 'Размер: ' + this.size : ''
        html += '</td>'
        html += '<td class="text-center">'
          html += '<div class="shk-input_count"><button type="button" class="btn btn-info btn-sm product_count_minus" name="button">-</button>'
          html += '<input data-atr="' + this.art + '" type="text" class="product_count form-control input-sm text-center" name="count" min="1" value="' + this.count + '"></input>'
          html += '<button type="button" class="btn btn-info btn-sm product_count_plus" name="button">+</button></div>'
        html += '</td>'
        html += '<td class="text-center" style="min-width: 150px">'
          html += this.price + ' р.'
        html += '</td>'
        html += '<td>'
          html += (parseInt(this.price) * parseInt(this.count)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + ' р.'
        html += '</td>'
        html += '<td class="text-right">'
          html += '<a data-atr="' + this.art + '" class="btn btn-sm btn-default" type="button" value="cart/remove"><span class="glyphicon glyphicon-remove"></span></a></td></tr>'
        html += '</td>'
      html += '</tr>'

      cart_html += html
      sum = parseInt(sum + this.price * this.count)
      count = parseInt(count) + parseInt(this.count)
    })
    cart_html += '</tbody>'

    // -- Собираем итог
    var
    html = '<tfoot><tr>'
      html += '<td class="text-right" colspan="3"><strong>' + 'Итого:' + '</strong></td>'
      html += '<td class="text-center">'
        html += '<strong><span id="cart_count">' + count + '</span></strong> шт.'
      html += '</td>'
      html += '<td class="text-center" colspan="2">'
        html += '<strong><span id="cart_sum">' + sum + '</span></strong> р.'
      html += '</td>'
      html += '<td>'
      html += '</td>'
    html += '</tr></tfoot>'
    cart_html += html

    // -- Вставляем
    $(document).find(form_order_cart).find('table tbody').remove()
    $(document).find(form_order_cart).find('table colgroup').after(cart_html)
    $(document).find(form_order_cart).find('#input_products').val(JSON.stringify(oProducts.items))
    $(document).find('.form_order').show()
  }

  cart_update()

  // - Добавление товара
  $(document).find(button_add).on('click', function() {
    // Переход в корзину если уже добавлен

    // Объект добавляемого товара
    msOProduct = ms_product_scan( $(this).parents(msSProduct).find(msSProductArt).val() )

    // Анимация
    // $(this).addClass('_active_')
    $(this).parents(msSProduct).find(msSProductStatus).show()
    // $(this).html( $(this).html().replace('корзину', 'корзине') )

    if (localStorage.getItem('MicroShop')) {
      // Если товары уже есть в корзине
      // Проверяем что такого товара нет
      var
      msOProducts = JSON.parse(localStorage.getItem('MicroShop')),
      // msOProducts = msOProducts.items,
      msBAdd = true

      $.each(msOProducts.items, function() {
        if (this.art == msOProduct.art) {
          // Уже есть, увеличиваем количество
          this.count = parseInt(this.count) + parseInt(msOProduct.count)
          localStorage.setItem('MicroShop', JSON.stringify({
            'items': msOProducts
          }))
          msBAdd = false
        }
      })

      if (msBAdd) {
        // Такого ещё нет, добавляем
        msOProducts.items.push(msOProduct)
        localStorage.setItem('MicroShop', JSON.stringify({
          'items': msOProducts.items
        }))
      }
    }
    else {
      // Добавляем, если корзина еще пуста
      localStorage.setItem('MicroShop', JSON.stringify({
        'items': [msOProduct]
      }))
    }

    cart_reload()
    return false
  })

  // - Удаление товара
  $(document).find(button_remove).on('click', function() {
    if ( ! localStorage.getItem('MicroShop')) return false
    // Объект удаляемого товара
    var msOProduct = {
      art: $(this).data().atr
    }

    msOProducts = JSON.parse(localStorage.getItem('MicroShop'))
    // msOProducts = JSON.parse(msOProducts.items)
    msOProducts = msOProducts.items

    if (msOProducts.length == 1) {
      // Если в корзине 1 продукт удаляем всё
      localStorage.removeItem('MicroShop')
      // Удаляем из таблицы
      $(button_remove + '[data-atr="' + msOProduct.art + '"]').parents('tr').remove()
      cart_reload()
    } else {
      $.each(msOProducts, function(index, elem) {
        // Если в корзине больше 1, ищём нужный
        if (elem.art == msOProduct.art) {
          // Удаляем из корзины
          msOProducts.splice(index, 1)
          localStorage.setItem('MicroShop', JSON.stringify({
            'items': msOProducts
          }))

          // Удаляем из таблицы
          $(button_remove + '[data-atr="' + msOProduct.art + '"]').parents('tr').remove()
        }
      })
      cart_reload()
    }
    return false
  })

  // - Удаление всех товаров
  $(document).find(button_remove_all).on('click', function() {
    localStorage.removeItem('MicroShop')
    cart_reload()
    return false
  })

  // - Изменения количества товара
  $(document).find(product_count).on('change click', function() {
    var msOProduct = {
      art: $(this).data().atr,
      count: $(this).val()
    }

    msOProducts = JSON.parse(localStorage.getItem('MicroShop'))
    msOProducts = msOProducts.items

    $.each(msOProducts, function() {
      if (this.art == msOProduct.art) {
        // Находим товар и меняем количество
        this.count = parseInt(msOProduct.count)
        localStorage.setItem('MicroShop', JSON.stringify({
          'items': msOProducts
        }))
      }
    })

    cart_reload()
  })


  // - В поле количества ввод только цифр
  $('[name=count]').bind("change keyup input click", function() {
    if (this.value.match(/[^0-9]/g)) this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value == 0) this.value = 1
  })

  // - Стрелочки для изменения количества товара
  $(document).find('.product_count_minus').on('click', function() {
    if ($(this).next('[name=count]').val() != 1) $(this).next('[name=count]').val(parseInt($(this).next('[name=count]').val()) - 1).click()
    return false
  })
  $(document).find('.product_count_plus').on('click', function() {
    $(this).prev('[name=count]').val(parseInt($(this).prev('[name=count]').val()) + 1).click()
    return false
  })
})
// MicroShop x

// Отправка сообщений AjaxForm
// $(document).on('af_complete', function(event, response) {
//   var form = response.form
//   // Если у формы определённый id
//   // - Оформление заказа
//   if (form.attr('id') == 'form_order') order_success()
// })
// Отправка сообщений х
