# MicroShop
## MODX REVO | FormIt | AjaxForm | JS | jQuery | LocalStorage | BootStrap4 | FontAveasome
> Магазин с хранением и обработкой товаров на стороне пользователя  
> Подробности на [trywar.ru](https://trywar.ru/3/205/)

### Содержуха
ajaxform.tpl - _Вывод AjaxForm_  
order.php - _Хук для AjaxForm который приводит товары в таблицу перед отправкой_  
main.html - _html формы оформления заказа и всего необходимого_  
main.js - _Сам движок на js_  
email.tpl - _Письмо на почту с контактами и списком товаров_  
main.css - _Скрываем не нужное через css_  
___

В *main.js* начиная со строчки 126 собирается инфа о товаре при добавлении его в корзину, там нужно поменять как нужно
```
var oProduct = {
    art: form.find('.product_art_value').val(),
    price: form.find('.product_price_value').val(),
    count: form.find('.product_count_value').val(),
    url: window.location.pathname,
    img: $('.slider-catalog-item-nav .slick-slide:eq(0) img').attr('src'),
    name: $('.product_name_value').html(),
  }
```
___

### shopkeeper3
В файле _shopkeeper3.php_ лежит плагин для добавления товаров в shopkeeper3  
Для прикручивания к shopkeeper3 так же понадобиться внести небольшие изменения в _main.js_,
а именно, если товары с разными параметрами, нужно пихать к артикулу (art) доп инфу, типа id параметра, и добавить чистый id товара, чтобы товары в шопкиппер добавлялись по id но в микро корзине не дублировались.

_Пример_
```
// Объект добавляемого товара
var form = $(this).parents('form'),
    size = form.find('[name^=size]:checked').val() ? form.find('[name^=size]:checked').val() : form.find('[name^=size]').val(),
    oProduct = {
      art: form.find('[name="shk-id"]').val(),
      id: form.find('[name="shk-id"]').val(),
      price: $(this).parents('.microshop_product').find('.shk-price').html(),
      count: form.find('[name=count]').val(),
      url: form.find('[name=url]').val(),
      img: $(this).parents('.microshop_product').find('.shk-image').attr('src'),
      name: form.find('[name="shk-name"]').val(),
      size: size,
    }

if ( size ) {
  // Артикул по цвету
  oProduct['art'] = form.find('[name="shk-id"]').val() + size

  // Размеры
  if ( form.find('[name^=size]:checked').val() ) {
    oProduct['size_val'] = $('[for="'+form.find('[name^=size]:checked').attr('id')+'"]').text()
  }
  else {
    var oSize_val = JSON.parse( form.find('[name=product_sizes]').val() )
    for (var key in oSize_val) {
      oProduct['size_val'] = key
      break
    }
  }
}
```
