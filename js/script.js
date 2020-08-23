const width = 20;
const grid = document.querySelector(".grid");
let interval = null;
let snakeIndex = [189, 188, 187, 186];
let direction = 1;
let gameOn = false;
let intervalTime = 400;
let score = 0;

const createBoard = () => {
	for (let i = 0; i < width * width; i++) {
		const square = document.createElement("div");
		square.classList.add("square");
		square.setAttribute("id", i);
		grid.appendChild(square);
	}
};

createBoard();

const squares = [...document.querySelectorAll(".square")];

const createBoost = () => {
	const randomSquare = squares[Math.floor(Math.random() * squares.length)];
	randomSquare.classList.contains("snake")
		? createBoost()
		: randomSquare.classList.add("boost");
};

const removeBoost = () => {
	squares.forEach((square) => {
		square.classList.remove("boost");
	});
};

const getBoost = () => {
	if (squares[snakeIndex[0]].classList.contains("boost")) {
		squares[snakeIndex[0]].classList.remove("boost");
		createBoost();
		score += 1;
		document.querySelector(".score span").textContent = score;
		snakeIndex.push(snakeIndex[snakeIndex.length - 1] - direction);

		if (intervalTime > 40) {
			intervalTime -= 20;
			clearInterval(interval);
			createInterval();
		}
	}
};

const snakesDeath = () => {
	if (squares[snakeIndex[0]].classList.contains("snake")) {
		clearInterval(interval);
		snakeIndex.forEach((index) => {
			squares[index].classList.add("dead");
		});
		gameOn = false;

		firestore
			.collection("data")
			.doc("s9HftP8bOpNfcUmVavIP")
			.get()
			.then((doc) => {
				if (score > doc.data().HiScore) {
					firestore
						.collection("data")
						.doc("s9HftP8bOpNfcUmVavIP")
						.update({ HiScore: score })
						.then(
							firestore
								.collection("data")
								.doc("s9HftP8bOpNfcUmVavIP")
								.get()
								.then((doc) => {
									document.querySelector(
										".hi-score span"
									).textContent = doc.data().HiScore;
								})
						);
				}
			});
	}
};

const removeDeadSnake = () => {
	squares.forEach((square) => {
		square.classList.remove("dead");
	});
};

const createSnake = () => {
	squares[snakeIndex[0]].classList.add("head");
	for (let i = 1; i < snakeIndex.length; i++) {
		squares[snakeIndex[i]].classList.add("snake");
	}
};

const removeSnake = () => {
	squares.forEach((square) => {
		square.classList.remove("head");
		square.classList.remove("snake");
	});
};

const keyboardControl = () => {
	document.addEventListener("keyup", (e) => {
		if (gameOn) {
			switch (e.key) {
				case "ArrowUp":
					direction = -width;
					break;
				case "ArrowDown":
					direction = width;
					break;
				case "ArrowLeft":
					direction = -1;
					break;
				case "ArrowRight":
					direction = 1;
					break;
			}
		}
	});
};

const SwipeControl = () => {
	let XStart = 0;
	let YStart = 0;
	let XEnd = 0;
	let YEnd = 0;

	document.addEventListener("touchstart", (e) => {
		XStart = Math.floor(e.touches[0].clientX);
		YStart = Math.floor(e.touches[0].clientY);
	});

	document.addEventListener("touchend", (e) => {
		XEnd = Math.floor(e.changedTouches[0].clientX);
		YEnd = Math.floor(e.changedTouches[0].clientY);
		let XDrag = XEnd - XStart;
		let YDrag = YEnd - YStart;
		if (Math.abs(XDrag) > Math.abs(YDrag) && XDrag < 0) {
			direction = -1;
		} else if (Math.abs(XDrag) > Math.abs(YDrag) && XDrag > 0) {
			direction = 1;
		} else if (Math.abs(XDrag) < Math.abs(YDrag) && YDrag < 0) {
			direction = -width;
		} else if (Math.abs(XDrag) < Math.abs(YDrag) && YDrag > 0) {
			direction = width;
		}
	});
};

const moveSnake = (direction) => {
	removeSnake();
	snakeIndex.pop();
	snakeIndex.unshift(direction);
	createSnake();
};

const createInterval = () => {
	interval = setInterval(() => {
		if (snakeIndex[0] - width < 0 && direction === -width) {
			moveSnake(width * width - width + snakeIndex[0]);
		} else if (snakeIndex[0] + width >= width * width && direction === width) {
			moveSnake(snakeIndex[0] - (width * width - width));
		} else if (snakeIndex[0] % width === width - 1 && direction === 1) {
			moveSnake(snakeIndex[0] - width + 1);
		} else if (snakeIndex[0] % width === 0 && direction === -1) {
			moveSnake(snakeIndex[0] + width - 1);
		} else {
			moveSnake(snakeIndex[0] + direction);
		}
		getBoost();
		snakesDeath();
	}, intervalTime);
};

const playGame = () => {
	if (!gameOn) {
		removeBoost();
		removeDeadSnake();
		intervalTime = 400;
		score = 0;
		document.querySelector(".score span").textContent = score;
		removeSnake();
		snakeIndex = [189, 188, 187, 186];
		createSnake();
		keyboardControl();
		SwipeControl();
		createInterval();
		createBoost();
		direction = 1;
		gameOn = true;
	}
};

createSnake();

document.addEventListener("click", playGame);

const readHiScore = firestore
	.collection("data")
	.get()
	.then((snapshot) => {
		snapshot.docs.forEach((doc) => {
			document.querySelector(".hi-score span").textContent = doc.data().HiScore;
		});
	});
