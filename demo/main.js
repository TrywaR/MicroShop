$(function(){
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
    var
    html = '<tr>'
      html += '<td>'
        html += index + 1
      html += '</td>'
      html += '<td>'
        html += '<a href="' + this.url + '">' + this.name + '</a>'
      html += '</td>'
      html += '<td class="text-center">'
        html += this.art
      html += '</td>'
      html += '<td class="text-center" style="min-width: 150px">'
        html += this.price + ' р.'
      html += '</td>'
      html += '<td class="text-center d-flex justify-content-center">'
        html += '<button type="button" class="form-control btn product_count_minus" name="button">-</button>'
          html += '<input data-atr="'+this.art+'" type="text" class="product_count form-control" name="count" min="1" value="'+this.count+'"></input>'
        html += '<button type="button" class="form-control btn product_count_plus" name="button">+</button>'
        html += '</td>'
      html += '<td class="text-center">'
        html += '<button data-atr="' + this.art + '" class="btn form-control" type="button" value="cart/remove"><i class="fas fa-minus-circle"></i></button></td></tr>'
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
      html += '<strong><span id="cart_sum">' + sum + '</span></strong> р.'
    html += '</td>'
    html += '<td class="text-center">'
      html += '<strong><span id="cart_count">' + count + '</span></strong> шт.'
    html += '</td>'
    html += '<td class="text-center">'
      html += '<button data-atr="' + this.art + '" class="btn form-control" type="button" value="cart/removeall"><i class="fas fa-trash-alt"></i></button></td></tr>'
    html += '</td>'
  html += '</tr></tfoot>'

  cart_html += html

  // -- Вставляем
  $(document).find(form_order_cart).find('table thead').after(cart_html)
  $(document).find(form_order_cart).find('#input_products').val(JSON.stringify(oProducts.items))
  $(document).find('.form_order').show()
}

// - Получем объект товара из html
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
      name: msOProductBlock.find(msSProductName).val(),
      size: msOProductBlock.find(msSProductSize).val()
    }

    // Если есть размер
    if ( msOProductBlock.find(msSProductSize).val() ) {
      // Добавляем размер и правим артикул
      msOProduct.size = msOProductBlock.find(msSProductSize).val()
      msOProduct.art = parseFloat( msOProduct.art + '.' + msOProduct.price )
    }
    // Тоже самое на странице товара
    // !!!
    // if ( msOProductBlock.find('[name^=size]:checked').val() ) {
    //   // Добавляем размер и правим артикул
    //   msOProduct.size = $('label[for='+msOProductBlock.find('[name^=size]:checked').attr('id')+']').html()
    //   msOProduct.art = parseFloat( msOProduct.art + '.' + msOProduct.price )
    // }
  }
  return msOProduct
}

// - Пересчёт товаров
function cart_reload() {
  if (localStorage.getItem('MicroShop')) {
    msOProducts = JSON.parse(localStorage.getItem('MicroShop'))
    msOProducts = msOProducts.items
    count = 0
    sum = 0

    $.each(msOProducts, function() {
      count = parseInt(count) + parseInt(this.count)
      sum = parseInt(sum + this.price * this.count)
    })

    $(document).find(button_cart).find('.shop_cart_btn span').html(count)
    $(button_cart).show()

    // Если на странице корзины то и данные в форме бомбим
    if ($(document).find(form_order_cart).length > 0) {
      $(document).find('#cart_count').html(count)
      $(document).find('#cart_sum').html(sum)
    }

    // Обновляем товары в корзине если на её странице
    if ( $(document).find('#input_products').length > 0 ) $(document).find('#input_products').val(JSON.stringify(msOProducts))
  } else {
    // $(button_cart).hide()
    $(form_order).hide()
    $(form_order_null).show()
  }

  cart_save() // Сохранение результатов
}
cart_reload()

// Обновление товаров
function cart_update(){
  // Получаем товары с сервера
  if ( msBServer ) {
    $.ajax({
      url: msSServerUrl,
      method: "POST",
      data: {'MicroShop':'show'}
    }).done(function( data ) {
      msOCartProducts = $.parseJSON( data )
      // Если товары есть
      if ( msOCartProducts.length ) {
        // Перебираем и синхронизируем товары с товарами в кэше
        $.each(msOCartProducts, function() {
          cart_product_synch( this )
        })
      }
    })
  }

  // Получаем товары со страницы
  if ( msBPage ) {
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
  }
}

// Синхронизируем товары в локальном хранилище
function cart_product_synch( msOProduct ){
  var
  msOMicroShop = JSON.parse(localStorage.getItem('MicroShop')),
  msOProducts = oMicroShop.items,
  msBAdd = true

  // Перебираем товары которые есть
  $.each(msOProducts, function() {
    // Если нужный товар уже есть в корзине, меняем значения
    if ( msOProduct.art == this.art ) {
      if ( parseInt(this.count) != parseInt(msOProduct.count) ) this.count = parseInt(msOProduct.count)
      this.price = parseFloat(msOProduct.price)
      msBAdd = false
    }
  })

  // Если товара ещё нет в корзинет, добавляем
  if ( msBAdd ) msOProducts.push(oProduct)

  // Сохраняем изменения
  if ( msOProducts.length ) {
    localStorage.setItem('MicroShop', JSON.stringify({
      'items': msOProduct
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
  if ( ! localStorage.getItem('MicroShop') ) return false

  var
  msOMicroShop = JSON.parse(localStorage.getItem('MicroShop')),
  msOProducts = msOMicroShop.items

  $.ajax({
    url: msSServerUrl,
    method: "POST",
    data: {'MicroShop':'save','products': msOProducts}
  })
}

// - Отправка
function order_success() {
  $(document).find(form_order).hide()
  localStorage.removeItem('MicroShop')
  $(document).find(form_order_success).show()
}

// - Добавление товара
$(document).find(button_add).on('click', function() {
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
    msOProducts = msOProducts.items,
    msBAdd = true

    $.each(msOProducts, function() {
      // Уже есть, увеличиваем количество
      if (this.art == msOProduct.art) {
        this.count = parseInt(this.count) + parseInt(msOProduct.count)
        localStorage.setItem('MicroShop', JSON.stringify({
          'items': msOProducts
        }))
        msBAdd = false
      }
    })

    if ( msBAdd ) {
      // Такого ещё нет, добавляем
      msOProducts.push(msOProduct)
      localStorage.setItem('MicroShop', JSON.stringify({
        'items': msOProducts
      }))
    }
  }
  else {
    // Добавляем, если корзина еще пуста
    localStorage.setItem('MicroShop', JSON.stringify({
      'items': [msOProduct]
    }))
  }

  if( msBjGrowl ) $.jGrowl("Товар добавлен в корзину")
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
  msOProducts = msOProducts.items

  if (msOProducts.length == 1) {
    // Если в корзине 1 продукт удаляем всё
    localStorage.removeItem('MicroShop')
    // Удаляем из таблицы
    $(button_remove + '[data-atr="' + msOProduct.art + '"]').parents('tr').remove()
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
  }

  if( msBjGrowl ) $.jGrowl("Товар удалён из корзины")
  cart_reload()
  return false
})

// - Удаление всех товаров
$(document).find(button_remove_all).on('click', function() {
  localStorage.removeItem('MicroShop')
  if( msBjGrowl ) $.jGrowl("Товары удалены из корзины")
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
$(document).find('.product_count_minus').on('click',function(){
  if ($(this).next('[name=count]').val() != 1) $(this).next('[name=count]').val(parseInt($(this).next('[name=count]').val()) - 1).click()
})
$(document).find('.product_count_plus').on('click',function(){
  $(this).prev('[name=count]').val(parseInt($(this).prev('[name=count]').val()) + 1).click()
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
})
