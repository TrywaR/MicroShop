<!-- <?php -->
/**
 * MicroShop
 *
 * @internal    @events OnSHKcartLoad
 *
 */

$e = &$modx->Event;
$output = "";

if ($e->name == 'OnSHKcartLoad') {
  // Собираем продукты
  if ( isset($_POST['products']) ) {

    // Получаем товары
    $arrProducts = json_decode($_POST['products']); # Товары из локалсторедж
    $addArrProducts = array(); # Добавляемые, обработанные продукты

    // Сортируем товары по названию
    function cmp($a, $b) {
      return strcmp($a->name, $b->name);
    }
    usort($arrProducts, "cmp");

    // Обрабатываем товары
    foreach ($arrProducts as $arrProduct) {

      // Инфа о товаре
      $addArrProduct = array();
      $addArrProduct['id'] = (int)$arrProduct->id;
      $addArrProduct['count'] = (int)$arrProduct->count;
      $addArrProduct['price'] = (int)$arrProduct->price;
      $addArrProduct['name'] = $arrProduct->name;
      $addArrProduct['options']['size'][] = 'Размер: ' . $arrProduct->size;
      $addArrProduct['className'] = 'ShopContent';
      $addArrProduct['packageName'] = 'shop';

      // Добавляем в кучу
      $addArrProducts[] = $addArrProduct;
    }

    // Добавляем товары в сессию
    $_SESSION['shk_order'] = $addArrProducts;
  }
}
