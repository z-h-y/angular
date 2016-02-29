<?php
$type = isset($_GET['type']) ? $_GET['type'] : '';
$filter = isset($_GET['filter']) ? json_decode($_GET['filter']) : '';
$url = isset($_GET['url']) ? $_GET['url'] : '';
$timeUnit = isset($_GET['timeUnit']) ? $_GET['timeUnit'] : '';
$items = isset($_GET['items']) ? $_GET['items'] : '';
$date = $filter->startDate.'~'.$filter->endDate;
switch ($type) {
	case 'summary':
		# code...
		$result = array(
			'data' => array(
				array(
					'date' => $date, 
					'pv' => mt_rand(1000,10000), 
					'uv' => mt_rand(1000,10000), 
					'nv' => mt_rand(1000,10000),
					'ip' => mt_rand(1000,10000), 
					'bounceRate' => '14%', 
					'avgDuration' => mt_rand(10,100), 
					'avgPage' => 4
					)
				)
			);
		echo json_encode($result);
	break;

	case 'chart':
		# code...
		$result = array(
			'data' => array(
				array(
					'name' => '直接访问',
					'data' => array(
						array(
							'date' => 0, 
							'pv' => 10000, 
							'uv' => 33345, 
							'nv' => 43543, 
							'ip' => 53434, 
							'bounceRate' => 0.4, 
							'avgDuration' => 34, 
							'avgPage' => 4
							),
						array(
							'date' => 2, 
							'pv' => mt_rand(1000,10000), 
							'uv' => mt_rand(1000,10000), 
							'nv' => mt_rand(1000,10000), 
							'ip' => mt_rand(1000,10000), 
							'bounceRate' => 0.6, 
							'avgDuration' => mt_rand(10,100), 
							'avgPage' => 3
							),
						array(
							'date' => 4, 
							'pv' => mt_rand(1000,10000), 
							'uv' => mt_rand(1000,10000), 
							'nv' => mt_rand(1000,10000), 
							'ip' => mt_rand(1000,10000), 
							'bounceRate' => 0.3, 
							'avgDuration' => mt_rand(10,100), 
							'avgPage' => 2
							)
						)
					),
				array(
					'name' => '搜索引擎',
					'data' => array(
						array(
							'date' => 0, 
							'pv' => 10000, 
							'uv' => 33345, 
							'nv' => 43543, 
							'ip' => 53434, 
							'bounceRate' => 0.4, 
							'avgDuration' => 34, 
							'avgPage' => 4
							),
						array(
							'date' => 2, 
							'pv' => mt_rand(1000,10000), 
							'uv' => mt_rand(1000,10000), 
							'nv' => mt_rand(1000,10000), 
							'ip' => mt_rand(1000,10000), 
							'bounceRate' => 0.6, 
							'avgDuration' => mt_rand(10,100), 
							'avgPage' => 3
							),
						array(
							'date' => 4, 
							'pv' => mt_rand(1000,10000), 
							'uv' => mt_rand(1000,10000), 
							'nv' => mt_rand(1000,10000), 
							'ip' => mt_rand(1000,10000), 
							'bounceRate' => 0.3, 
							'avgDuration' => mt_rand(10,100), 
							'avgPage' => 2
							)
						)
					),
				array(
					'name' => '外部链接',
					'data' => array(
						array(
							'date' => 0, 
							'pv' => 10000, 
							'uv' => 33345, 
							'nv' => 43543, 
							'ip' => 53434, 
							'bounceRate' => 0.4, 
							'avgDuration' => 34, 
							'avgPage' => 4
							),
						array(
							'date' => 2, 
							'pv' => mt_rand(1000,10000), 
							'uv' => mt_rand(1000,10000), 
							'nv' => mt_rand(1000,10000), 
							'ip' => mt_rand(1000,10000), 
							'bounceRate' => 0.6, 
							'avgDuration' => mt_rand(10,100), 
							'avgPage' => 3
							),
						array(
							'date' => 4, 
							'pv' => mt_rand(1000,10000), 
							'uv' => mt_rand(1000,10000), 
							'nv' => mt_rand(1000,10000), 
							'ip' => mt_rand(1000,10000), 
							'bounceRate' => 0.3, 
							'avgDuration' => mt_rand(10,100), 
							'avgPage' => 2
							)
						)
					)
				)
			);
		echo json_encode($result);
	break;	

	case 'article':
		# code...
		$result = array(
			'data' => array(
				array(
					'title' => '直接访问',
					'date' => $date, 
					'pv' => 10000, 
					'uv' => 33345, 
					'nv' => 43543, 
					'ip' => 53434, 
					'bounceRate' => 0.4, 
					'avgDuration' => 34, 
					'avgPage' => 4
					),
				array(
					'title' => '搜索引擎',
					'date' => $date, 
					'pv' => mt_rand(1000,10000), 
					'uv' => mt_rand(1000,10000), 
					'nv' => mt_rand(1000,10000), 
					'ip' => mt_rand(1000,10000), 
					'bounceRate' => 0.6, 
					'avgDuration' => mt_rand(10,100), 
					'avgPage' => 3
					),
				array(
					'title' => '外部链接',
					'date' => $date, 
					'pv' => mt_rand(1000,10000), 
					'uv' => mt_rand(1000,10000), 
					'nv' => mt_rand(1000,10000), 
					'ip' => mt_rand(1000,10000), 
					'bounceRate' => 0.3, 
					'avgDuration' => mt_rand(10,100), 
					'avgPage' => 2
					)
				)
			);
		echo json_encode($result);
	break;
}