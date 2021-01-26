<?
// MicroShop synchronization
if ($modx->event->name == 'OnPageNotFound') {
  // Получаем пользователя
  $user = $modx->getUser();
  $iUserId = $user->get('id');

  switch ($_REQUEST['MicroShop']) {
    case 'show':  # Вывод корзины из базы
      if ( ! $iUserId ) die();
      // Получаем корзину
      $result = $modx->query("SELECT * FROM `modx_microshop` WHERE `user` = " . $iUserId);
      if ( is_object($result) ) echo json_encode( $result->fetch(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE );
      die(); break;

    case 'update':  # Оновление товаров
      // Получаем продукты
      if ( isset($_REQUEST['products']) ) {
        // $arrProducts = json_encode($_REQUEST['products'], JSON_UNESCAPED_UNICODE);
        $arrProducts = $_REQUEST['products'];
        // Обновляем продукты
        foreach ($arrProducts as &$arrProduct) {
          // Берём товар из базы
          $result = $modx->query("SELECT * FROM `modx_shop_content` WHERE `id` = '" . $arrProduct['id'] . "'");
          if ( is_object($result) ) {
            $arrNewProduct = $result->fetch(PDO::FETCH_ASSOC);
            // Достаём цену
            $arrNewProductPrice = 0;
            $arrProductSizes = $arrNewProduct['size'];
            $arrProductSizes = explode('||', $arrProductSizes);
            foreach ($arrProductSizes as $arrProductSize) {
              $arrNewProductSize = explode('==', $arrProductSize);
              if ( $arrProduct['size'] == $arrNewProductSize[0] ) $arrNewProductPrice = $arrNewProductSize[1];
            }
            // Обновляем цены
            if ( $arrNewProductPrice ) $arrProduct['price'] = $arrNewProductPrice;
            // Возвращяем обновлённый товар
          }
        }
        // Возвращяем продукты
        if ( count($arrProducts) && $iUserId > 0 ) {
          $result = $modx->query("SELECT * FROM `modx_microshop` WHERE `user` = " . $iUserId);
          $arrUserCart = $result->fetch(PDO::FETCH_ASSOC);
          if ( isset($arrUserCart['products']) ) {
            $arrCartProducts = $arrUserCart['products'];
            // Товары в корзине базы в удобный вид
            foreach ($arrCartProducts as $arrCartProduct) $arrCartProductsIds[$arrCartProduct['id']] = $arrCartProduct;
            // Перебираем новые товары
            foreach ($arrProducts as & $arrProduct)
            // Товар уже есть в корзине
            if ( isset($arrCartProductsIds[$arrProduct['id']]) )
            $arrProduct['count'] = $arrCartProductsIds[$arrProduct['id']]['count'] + $arrProduct['count'];
            $sQuery = "UPDATE `modx_microshop` SET `products`='" . json_encode($arrProducts, JSON_UNESCAPED_UNICODE) . "',`last_update`='" . date('Y-m-d H:i:s') . "' WHERE `user` = " . $iUserId;
          }
          // Добавляем новую коризу
          else
          $sQuery = "INSERT INTO `modx_microshop` (`products`,`user`,`last_update`) VALUES('". json_encode($arrProducts, JSON_UNESCAPED_UNICODE) . "','" . $iUserId . "', '" . date('Y-m-d H:i:s') . "')";
          $modx->query($sQuery);
        }
        echo json_encode($arrProducts);
      }
      die(); break;

    case 'save': # Сохраняем коризну в базу
      if ( ! $iUserId ) die();
      // Получаем продукты
      $arrProducts = json_encode($_REQUEST['products'], JSON_UNESCAPED_UNICODE);
      if ( count($arrProducts) ) {
        $result = $modx->query("SELECT * FROM `modx_microshop` WHERE `user` = " . $iUserId);
        $arrUserCart = $result->fetch(PDO::FETCH_ASSOC);
        if ( isset($arrUserCart['products']) ) {
          $arrCartProducts = $arrUserCart['products'];
          // Товары в корзине базы в удобный вид
          foreach ($arrCartProducts as $arrCartProduct) $arrCartProductsIds[$arrCartProduct['id']] = $arrCartProduct;
          // Перебираем новые товары
          foreach ($arrProducts as & $arrProduct)
          // Товар уже есть в корзине
          if ( isset($arrCartProductsIds[$arrProduct['id']]) )
          $arrProduct['count'] = $arrCartProductsIds[$arrProduct['id']]['count'] + $arrProduct['count'];
          $sQuery = "UPDATE `modx_microshop` SET `products`='" . $arrProducts . "',`last_update`='" . date('Y-m-d H:i:s') . "' WHERE `user` = " . $iUserId;
        }
        // Добавляем новую коризу
        else
        $sQuery = "INSERT INTO `modx_microshop` (`products`,`user`,`last_update`) VALUES('". $arrProducts . "','" . $iUserId . "', '" . date('Y-m-d H:i:s') . "')";
        $modx->query($sQuery);
      }
      die(); break;
  }
}
