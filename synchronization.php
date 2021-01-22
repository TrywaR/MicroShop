<?
// MicroShop synchronization
function MicroShop_product_update( $arrProduct ){
  // Получаем товар
  $result = $modx->query("SELECT * FROM `modx_shopkeeper3_purchases` WHERE `p_id` = " . $arrProduct['id']);
  if ( is_object($result) ) {
    $arrNewProduct = $result->fetch(PDO::FETCH_ASSOC);
    // Обновляем цены
    $arrProduct['price'] = $arrNewProduct['price'];
    // Возвращяем обновлённый товар
    return $arrProduct;
  }
}

if ($modx->event->name == 'OnPageNotFound') {
  switch ($_REQUEST['MicroShop']) {
    case 'show':  # Вывод корзины из базы
      // Получаем пользователя
      $user = $modx->getUser();
      if ( $user->get('id') ) {
        // Получаем корзину
        $result = $modx->query("SELECT * FROM `modx_microshop` WHERE `user` = " . $user->get('id'));
        if ( is_object($result) ) echo json_encode( $result->fetch(PDO::FETCH_ASSOC) );
      }
      die(); break;

    case 'update':  # Оновление товаров
      // Получаем продукты
      // print_r($_POST);
      $arrProducts = json_encode($_REQUEST['products']);
      // Обновляем продукты
      // print_r($arrProducts);
      foreach ($arrProducts as &$arrProduct) $arrProduct = MicroShop_product_update($arrProduct);
      // Возвращяем продукты
      print_r($arrProducts);
      die(); break;

    case 'save': # Сохраняем коризну в базу
      // Получаем пользователя
      $user = $modx->getUser();
      if ( $user->get('id') ) {
        // Получаем продукты
        $arrProducts = json_encode($_REQUEST['products']);
        // Сохраняем продукты
        $modx->query("INSERT INTO `modx_microshop` (`products`,`user`,`last_update`) VALUES('". $arrProducts . "','" . $user->get('id') . "', '" . date('Y-m-d H:i:s') . "')");
      }
      die(); break;
  }
}
