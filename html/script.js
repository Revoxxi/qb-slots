/// Aceasta resursa a fost facuta de plesalex100#7387
/// Va rog sa o respectati, sa nu o vinde-ti sau postati fara permisiunea mea
/// Aceasta resursa a pornit de la: https://codepen.io/AdrianSandu/pen/MyBQYz
// Stiu ca nu se pun 3 slash-uri :)

// Poti sa adaugi sau sa scoti linii aici
// fiecare linie reprezinta succesiunea de cordonate care formeaza o linie,
// cordonate care incep de la 0 si se termina la 1
var lines = [
  [[0,0], [1,0], [2,0], [3,0], [4,0]],
  [[0,1], [1,1], [2,1], [3,1], [4,1]],
  [[0,2], [1,2], [2,2], [3,2], [4,2]],

  [[0,0], [1,1], [2,2], [3,1], [4,0]],
  [[0,2], [1,1], [2,0], [3,1], [4,2]]
];

// Poti sa modifici win multiply-urile la fiecare fruct
// primul 0 nu are nici o importanta
// fiecare linie reprezinta succesiunea de multiplicari in functie de cate fructe de acelasi timp sunt prinse la rand intr-o linie
// De exemplu: la Portocale daca prinzi 3 la rand multiply-ul o sa fie x4, daca prini 5 atunci aceasta va fi x40.
var winTable = [
  [0],
  [1,1,3,5,10], // Cirese
  [1,1,4,10,15], // Prune
  [1,1,4,10,15], // Lamai
  [1,1,4,10,15], // Portocale
  [1,1,10,20,50], // Struguri
  [1,1,10,20,50], // Pepene
  [1,1,20,150,600] // Septar
];

/// De aici in jos aveti grija ce modificati, o face-ti pe riscul vostru
const SLOTS_PER_REEL = 12;
const REEL_RADIUS = 209;

var fructe = ["", "Cirese", "Prune", "Lamai", "Portocale", "Struguri", "Pepene", "Septar"];

var audios = [];
var audioIds = [
  "changeBet",
  "pornestePacanele",
  "alarma",
  "winLine",
  "collect",
  "winDouble",
  "seInvarte",
  "apasaButonul"
];

var coins = 0;
var bet = 50;

var backCoins = coins * 2;
var backBet = bet * 2;

var rolling = 0;

function playAudio(audioName) {
  if($('#sounds').is(':checked')) {
    for(var i = 0; i < audioIds.length; i++) {
      if(audioIds[i] == audioName) {
        audios[i].play();
      }
    }
  }
}

function insertCoin(amount) {
  coins += amount;
  backCoins = coins * 2;
  $('#ownedCoins').empty().append(coins);
}
function setBet(amount) {
  if(amount > 0) {
    if(amount > coins) {
      amount = 50;
    }
    bet = amount;
    backBet = bet * 2;
    $('#ownedBet').empty().append(bet);
    playAudio("changeBet");
  }
}

var tbl1 = [], tbl2 = [], tbl3 = [], tbl4 = [], tbl5 = [];
var crd1 = [], crd2 = [], crd3 = [], crd4 = [], crd5 = [];

function createSlots(ring, id) {
	var slotAngle = 360 / SLOTS_PER_REEL;
	var seed = getSeed();

	for (var i = 0; i < SLOTS_PER_REEL; i ++) {
		var slot = document.createElement('div');
		var transform = 'rotateX(' + (slotAngle * i) + 'deg) translateZ(' + REEL_RADIUS + 'px)';
		slot.style.transform = transform;

    var imgID = (seed + i)%7 + 1;
    seed = getSeed();
    if (imgID == 7) {
      imgID = (seed + i)%7 + 1;
    }

    slot.className = 'slot' + ' fruit' + imgID;
    slot.id = id + 'id' + i;
		var content = $(slot).empty().append('<p>' + createImage(imgID) + '</p>');

		// add the poster to the row
		ring.append(slot);
	}
}

function createImage(id) {
  return '<img src="img/item' + id + '.png" style="border-radius: 20px;" width=100 height=100>';
}

function getSeed() {
	return Math.floor(Math.random()*(SLOTS_PER_REEL));
}

function setWinner(cls, level) {
  if(level >= 1) {
    var cl = (level == 1) ? 'winner1' : 'winner2';
    $(cls).addClass(cl);
  }
}

function reverseStr(str) {
  return str.split("").reverse().join("");
}

var canDouble = 0;
var colorHistory = [-1];

var dubleDate = 0;

function endWithWin(x, sound) {
  $('#win').empty().append(x);
  $('.win').show();
  $('.dblOrNothing').show();

  $('.betUp').empty().append("RED");
  $('.AllIn').empty().append("BLACK");
  $('.go').empty().append("COLLECT");

  canDouble = x;

  if(sound == 1) { // WinAtDouble
    playAudio("winDouble");
    dubleDate++;
    if(dubleDate >= 4) {
      pressROLL();
    }
  }
}

function looseDouble() {
  canDouble = 0;
  dubleDate = 0;
  $('.win').hide();
  $('.dblOrNothing').hide();

  $('.betUp').empty().append("+BET");
  $('.AllIn').empty().append("ALL IN");
  $('.go').empty().append("ROLL");
}

function voteColor(x, color) {
  var rcolor = Math.floor(Math.random()*(2));
  colorHistory[colorHistory.length] = rcolor;

  var pls = 1;
  for(var cont = colorHistory.length; cont >= colorHistory.length-8; cont--) {
    var imgColor = "none";
    if(colorHistory[cont] == 1) { imgColor = 'black'; }
    if(colorHistory[cont] == 0) { imgColor = 'red'; }
    $('#h' + pls).empty();
    if(imgColor !== "none") {
      $('#h' + pls).append("<img src='img/" + imgColor + ".png' width=30px height=30px/>");
      pls++;
    }
  }

  if(rcolor == color) {
    endWithWin(x*2, 1);
  } else {
    looseDouble();
  }
}

function spin(timer) {
	var winnings = 0, backWinnings = 0;
  playAudio("seInvarte");
	for(var i = 1; i < 6; i ++) {
    var z = 2;
		var oldSeed = -1;

		var oldClass = $('#ring'+i).attr('class');
		if(oldClass.length > 4) {
			oldSeed = parseInt(oldClass.slice(10));
		}
		var seed = getSeed();
		while(oldSeed == seed) {
			seed = getSeed();
		}

    var pSeed = seed
    for(var j = 1; j <= 5; j++) {
      pSeed += 1;
      if(pSeed == 12) {
        pSeed = 0;
      }
      if(j>=3) {
        var msg = $('#' + i + 'id' + pSeed).attr('class');
        switch(i) {
          case 1:
            tbl1[z] = reverseStr(msg)[0];
            crd1[z] = '#' + i + 'id' + pSeed
            break;
          case 2:
            tbl2[z] = reverseStr(msg)[0];
            crd2[z] = '#' + i + 'id' + pSeed
            break;
          case 3:
            tbl3[z] = reverseStr(msg)[0];
            crd3[z] = '#' + i + 'id' + pSeed
            break;
          case 4:
            tbl4[z] = reverseStr(msg)[0];
            crd4[z] = '#' + i + 'id' + pSeed
            break;
          case 5:
            tbl5[z] = reverseStr(msg)[0];
            crd5[z] = '#' + i + 'id' + pSeed
            break;
        }
        z -= 1;
      }
    }

		$('#ring'+i)
			.css('animation','back-spin 1s, spin-' + seed + ' ' + (timer + i*0.5) + 's')
			.attr('class','ring spin-' + seed);
	}
  var table = [tbl1,tbl2,tbl3,tbl4,tbl5];
  var cords = [crd1,crd2,crd3,crd4,crd5];

  for(var k in lines) {
    var wins = 0, last = table[lines[k][0][0]][lines[k][0][1]], lvl = 0, lasx;

    for(var x = 1 in lines[k]) {
      //|| last == "Septar" || table[lines[k][x][0]][lines[k][x][1]] == "Septar"
      if(last == table[lines[k][x][0]][lines[k][x][1]]) {
        wins++;
        //if(table[lines[k][x][0]][lines[k][x][1]] !== "Septar") {
          last = table[lines[k][x][0]][lines[k][x][1]];
        //}
      }
      else break;
    }

    switch (wins) {
      case 2:
        if(last == 1) {
          lvl = 1;
          setTimeout(playAudio, 3950, "winLine");
        }
        break;
      case 3:
        lvl = 1;
        setTimeout(playAudio, 3950, "winLine");
        break;
      case 4:
        lvl = 2;
        setTimeout(playAudio, 3200 + 700 + 0.3 * k * 1000, "alarma");
        break;
      case 5:
        lvl = 2;
        setTimeout(playAudio, 3200 + 0.3 * k * 1000, "alarma");
        break;
      default: 0;
    }
    if(lvl > 0) {
      winnings = winnings + bet * winTable[table[lines[k][wins-1][0]][lines[k][wins-1][1]]][wins-1];
      setTimeout(endWithWin, 4400, winnings, 0);
    }

    for(var p = wins - 1; p >= 0; p--) {
      setTimeout(setWinner, 3200 + 0.4 * p * 1000 + 0.3 * k * 1000, cords[lines[k][p][0]][lines[k][p][1]], lvl);
    }
  }
  setTimeout(function(){ rolling = 0; }, 4500);
}

function pressROLL() {
  if(rolling == 0) {
    if(canDouble == 0) {
      if(backCoins / 2 !== coins) {
        coins = backCoins / 2;
      }
      if(backBet / 2 !== bet) {
        bet = backBet / 2;
      }

      playAudio("apasaButonul");
      $('.slot').removeClass('winner1 winner2');
      if(coins >= bet && coins !== 0) {
        insertCoin(-bet);

        rolling = 1;
        var timer = 2;
        spin(timer);
      } else if(bet != coins && bet != 50) {
        setBet(coins);
      }
    } else {
      setTimeout(insertCoin, 200, canDouble);
      playAudio("collect");
      looseDouble();
    }
  }
  //else { // SKIP // Putin Buguita ( retul e sters )
  //  if(canSkip) {
  //    canSkip = 0;
  //    setTimeout(function(){ canSkip = 1; }, 4000);
  //    for(var i = 1; i < 6; i++) {
  //      var str = $('#ring'+i).css('animation')
  //      var theSeed = str.substring(str.length - 1, str.length);
  //      $('#ring'+i).css('animation', 'back-spin .5s, spin-' + theSeed + ' ' + '1s');
  //    }
  //    for(var i = 0; i < winCords.length; i++) {
  //      setTimeout(setWinner, 1000 + (0.25 * i) * 1000, winCords[i][0], winCords[i][1])
  //    }
  //    setTimeout(function(){ rolling = 0; }, 2000);
  //  }
  //}
}

function pressBLACK() {
  if(canDouble == 0) {
    setBet(coins);
  } else {
    voteColor(canDouble, 1);
  }
}

function pressRED() {
  if(canDouble == 0) {
    setBet(bet + 50);
  } else {
    voteColor(canDouble, 0);
  }
}

var allFile;

function resetRings() {
  var rng1 = $("#ring1"),
      rng2 = $("#ring2"),
      rng3 = $("#ring3"),
      rng4 = $("#ring4"),
      rng5 = $("#ring5");

  rng1.empty()
    .removeClass()
    .addClass("ring")
    .removeAttr('id')
    .attr('id', 'ring1');

  rng2.empty()
    .removeClass()
    .addClass("ring")
    .removeAttr('id')
    .attr('id', 'ring2');

  rng3.empty()
    .removeClass()
    .addClass("ring")
    .removeAttr('id')
    .attr('id', 'ring3');

  rng4.empty()
    .removeClass()
    .addClass("ring")
    .removeAttr('id')
    .attr('id', 'ring4');

  rng5.empty()
    .removeClass()
    .addClass("ring")
    .removeAttr('id')
    .attr('id', 'ring5');

  createSlots($('#ring1'), 1);
  createSlots($('#ring2'), 2);
  createSlots($('#ring3'), 3);
  createSlots($('#ring4'), 4);
  createSlots($('#ring5'), 5);
}

document.onkeyup = function (data) {
    if (data.which == 27) { // Escape key
        $.post('http://qb-slots/exitWith', JSON.stringify({}));
    }
};

function togglePacanele(start, banuti) {
  if(start == true) {
    allFile.css("display", "block");
    playAudio("pornestePacanele");
    coins = 0;
    insertCoin(banuti);

    resetRings();

    rolling = 1;
    setTimeout(function(){ rolling = 0; }, 4000);
  } else {
    allFile.css("display", "none");
    $.post("http://qb-slots/exitWith", JSON.stringify({
      coinAmount: backCoins / 2
    }));
    insertCoin(-coins); // Scoate toti banii din aparat
  }
}


window.addEventListener('message', function(event) {
  if(event.data.showPacanele == "open") {
    var introdusi = event.data.coinAmount;
    togglePacanele(true, introdusi);
  }
});

/// sa stii ca tot a fost facut cu pasiune si dragoste de plesalex100#7387
/// scriu asta aici pentru ca stiu ca doar cei carora le pasa ce
/// dreq s-a intamplat aici vor citii ceva. Timp total de munca: ~15 ore
/// De la ce am pornit: https://codepen.io/AdrianSandu/pen/MyBQYz
/// Everything it's possible !

$(document).ready(function() {
	allFile = $("#stage");
  allFile.css("display", "none");
  createSlots($('#ring1'), 1);
 	createSlots($('#ring2'), 2);
 	createSlots($('#ring3'), 3);
 	createSlots($('#ring4'), 4);
 	createSlots($('#ring5'), 5);
  for(var i = 0; i < audioIds.length; i++) {
    audios[i] = document.createElement('audio');
    audios[i].setAttribute('src', 'audio/' + audioIds[i] + '.wav');
    audios[i].volume = 0.6;
    if(audioIds[i] == "seInvarte") {
      audios[i].volume = 0.09;
    }
  }

  $('.win').hide();
  $('.dblOrNothing').hide();

  $('#ownedCoins').empty().append(coins);
  $('#ownedBet').empty().append(bet);

  $('body').keyup(function(e){
    $(':focus').blur();
    switch (e.keyCode) {
      case 32: pressROLL(); // space
        break;
      case 13: pressROLL(); // enter
        break;
      case 37: pressRED(); // left-arrow
        break;
      case 39: pressBLACK(); // right-arrow
        break;
      case 38: setBet(bet + 50); // creste BET
        break;
      case 40: setBet(bet - 50); // scade BET
        break;
      case 27: togglePacanele(false, 0); // ESC
        break;
      case 80: togglePacanele(false, 0); // P - Pause Menu
        break;
    }
  });

  $('.betUp').on('click', function(){ // RED
    pressRED();
  })

  $('.AllIn').on('click', function(){ // BLACK
    pressBLACK();
  })

 	$('.go').on('click',function(){ // COLLECT
    pressROLL();
 	})
 });
