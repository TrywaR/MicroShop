<?php
/**
 * MicroShop
 *
 * @internal    @events OnSHKcartLoad
 *
 */

$e = &$modx->Event;
$output = "";

if ($e->name == 'OnSHKcartLoad') {
  // При показе корзины добавляем товары из локал сторедж
  $modx->log(xPDO::LOG_LEVEL_ERROR, print_r($_POST['products'], 1));
  $modx->log(xPDO::LOG_LEVEL_ERROR, print_r($_SESSION, 1));

  // Собираем продукты
  if ( isset($_POST['products']) ) {

    $arrProducts = json_decode($_POST['products']); # Товары из локалсторедж
    $addArrProducts = array(); # Добавляемые, обработанные продукты

    foreach ($arrProducts as $arrProduct) {
      // Инфа о товаре
      $addArrProduct = array();
      $addArrProduct['id'] = (int)$arrProduct->id;
      $addArrProduct['count'] = (int)$arrProduct->count;
      $addArrProduct['price'] = (int)$arrProduct->price;
      $addArrProduct['name'] = $arrProduct->name;
      $addArrProduct['className'] = 'ShopContent';
      $addArrProduct['packageName'] = 'shop';

      // Инфа о параметрах, если есть
      if ( isset($arrProduct->size) ) {
        $arrSize = array();
        $arrSizeId = explode('__', $arrProduct->size); # id опции
        $arrSize[] = 'Размер: ' . $arrProduct->size_val;
        $arrSize[] = (int)$arrSizeId[1];
        $arrSize[] = (int)$arrSizeId[1];
        $arrSize[] = $arrProduct->size_val;
        $arrSize['multiplication'] = '';

        $addArrProduct['options']['size'] = $arrSize;
        $addArrProduct['price'] = 0;
      }

      // Добавляем в кучу
      $addArrProducts[] = $addArrProduct;
    }

    // Добавляем товары в сессию
    $_SESSION['shk_order'] = $addArrProducts;
  }
}
