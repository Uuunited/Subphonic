<?php
if (isset($_SERVER['HTTPS'])) {
    if ($_SERVER['HTTPS'] == 'on') {
        $addr = 'https://';
    } else {
        $addr = 'http://';
    }
} else {
    $addr = 'http://';
}

$addr .= $_SERVER["SERVER_NAME"];
$addr .= '/apps/subphonic/Subphonic/index.html';
?>

<iframe src="<?php echo $addr.'?s=' . $_['url'] . '&u=' . $_['user'] . '&p=' . $_['pass'] . '&l=' . $_['lang'] . '&sh=' . urlencode($_['urlH']) . '&uh=' . urlencode($_['userH']) . '&ph=' . urlencode($_['passH']) . '&ah=' . urlencode($_['apikeyH']); ?>" width="100%" id="ifm" ></iframe>

<script language="JavaScript">
    function pageY(elem) {
        return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
    }
    var buffer = 5; //scroll bar buffer
    function resizeIframe() {
        var height = document.documentElement.clientHeight;
        height -= pageY(document.getElementById('ifm'))+ buffer ;
        height = (height < 0) ? 0 : height;
        document.getElementById('ifm').style.height = height + 'px';
    }

    document.getElementById('ifm').onload=resizeIframe;
    window.onresize = resizeIframe;
</script>




