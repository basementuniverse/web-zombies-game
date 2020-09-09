<?php

header('Content-type: application/json');
error_reporting(E_ALL | E_STRICT);

$CFG["dbhost"] =	"localhost";
$CFG["dbname"] =	"zombies";
$CFG["dbuser"] =	"root";
$CFG["dbpass"] =	"";

$id = isset($_GET["id"]) ? $_GET["id"] : "default";
$method = $_SERVER["REQUEST_METHOD"];
$db = new PDO("mysql:host={$CFG['dbhost']};dbname={$CFG['dbname']}", $CFG["dbuser"], $CFG["dbpass"]);

// GET requests return a world config
if ($method == "GET") {
	$query = $db->prepare("CALL config_get(:id)");
	$query->execute(array(":id" => $id));
	$config = $query->fetch(PDO::FETCH_ASSOC);
	echo $config["data"];
} elseif ($method == "POST") {	// POST requests create a new world config and return the id
	$data = file_get_contents("php://input");
	$done = false;
	$count = 0;
	while (!$done && $count < 100) {
		$uniqueId = substr(md5(rand(0, 1000000)), 0, 7);
		$query = $db->prepare("CALL config_create(:id, :data)");
		$query->execute(array(":id" => $uniqueId, ":data" => $data));
		if ($query->rowCount() > 0) {
			$done = true;
			echo json_encode(array("id" => $query->fetchColumn()));
		}
		$count++;
	}
}
?>