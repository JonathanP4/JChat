const linksIdx = [];

const msg =
	"Veja esse vídeo http://www.yotube.com/12ja612ga7s.org e dps esse http://www.yotube.com/12ja612ga8s.com";

const match = msg.split(" ").map((word, idx) => {
	/http(s)?:\/\/.*/gi.test(word) ? console.log(word) : "";
});

// console.log(linksIdx);
