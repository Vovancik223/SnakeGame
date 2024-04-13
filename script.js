// LOL
Number.prototype[Symbol.iterator] = function*() { yield* Array.from({ length: this }, (_, i) => i) };

// Config
const WIDTH = 32;
const HEIGHT = 24;
const START_LENGTH = 5;
const START_POS = [2, ~~(HEIGHT / 2)];
const MIN_TPS = 5;
const MAX_TPS = 20;

(() => {
	const CELL_MAP = {};
	const SNAKE_HEAD = Symbol();
	const SNAKE = Symbol();
	const FRUIT = Symbol();
	const EMPTY = Symbol();
	
	let inputSequence = [];
	let dir = 'R';
	let snake = [];
	let isGameOver = false;
	let fruit;
	let score = 0;
	let tps = MIN_TPS;
	let started = false;
	
	const $main = document.querySelector('main');
	const $game = $main.querySelector('.game');
	const $score = $main.querySelector('#score');
	const $restart = $main.querySelector('#restart');
	
	document.addEventListener('keydown', e => {
		e.preventDefault();
		const { key } = e;
		if (['w', 'ArrowUp'].includes(key) && !inputSequence.includes('U') && (inputSequence.at(-1) || dir) !== 'D') {
			inputSequence.push('U');
		} else if (['s', 'ArrowDown'].includes(key) && !inputSequence.includes('D') && (inputSequence.at(-1) || dir) !== 'U') {
			inputSequence.push('D');
		} else if (['a', 'ArrowLeft'].includes(key) && !inputSequence.includes('L') && (inputSequence.at(-1) || dir) !== 'R') {
			inputSequence.push('L');
		} else if (['d', 'ArrowRight'].includes(key) && !inputSequence.includes('R') && (inputSequence.at(-1) || dir) !== 'L') {
			inputSequence.push('R');
		}
	})
	
	
	const init = () => {
		isGameOver = false;
		dir = 'R';
		inputSequence = [];
		snake = [];
		fruit = null;
		score = 0;
		$game.innerHTML = '';
		$game.style.setProperty('--width', WIDTH);
		$game.style.setProperty('--height', HEIGHT);
		$main.classList.remove('finished');
		
		for (let y of HEIGHT) {
			for (let x of WIDTH) {
				const $cell = document.createElement('span');
				CELL_MAP[`${x},${y}`] = {
					dom: $cell,
					type: EMPTY,
					x,
					y
				};
				const $checkbox = document.createElement('input');
				$checkbox.setAttribute('type', 'checkbox');
				const $radio = document.createElement('input');
				$radio.setAttribute('type', 'radio');
				$radio.checked = 'checked';
				$cell.append($radio);
				$cell.append($checkbox);
				$game.append($cell);
			}
		}
		
		for (let x of START_LENGTH) {
			const cell = CELL_MAP[`${START_POS[0] + x},${START_POS[1]}`];
			snake.push(cell);
			cell.type = x === START_LENGTH - 1 ? SNAKE_HEAD : SNAKE;
		}
		
		genFruit();
		tick();
	}
	
	const render = () => {
		Object.values(CELL_MAP).forEach(({ dom, type }) => {
			dom.className = {
				[SNAKE_HEAD]: 'snake snake-head',
				[SNAKE]: 'snake snake-body',
				[FRUIT]: 'fruit',
				[EMPTY]: 'empty'
			}[type];
			
			if ([SNAKE, SNAKE_HEAD].includes(type)) {
				dom.querySelector('input[type="checkbox"]').checked = 'checked';
			} else {
				dom.querySelector('input[type="checkbox"]').checked = '';
				dom.querySelector('input[type="checkbox"]').removeAttribute('checked');
			}
		});
		$score.innerText = score;
			    const $currentScore = document.getElementById('current-score');
    $currentScore.textContent = score;
	}


	const genFruit = () => {
		const options = Object.values(CELL_MAP).filter(({ type }) => type === EMPTY);
		tps = Math.min(MIN_TPS + (1 - options.length / (WIDTH * HEIGHT)) * (MAX_TPS - MIN_TPS) * 2, MAX_TPS);
		if (!options.length) {
			gameOver();
			return;
		}
		
		fruit = options[~~(Math.random() * options.length)];
		fruit.type = FRUIT;
	}
	
	const advance = () => {
		dir = inputSequence.shift() || dir;
		const tail = snake.at(0);
		const head = snake.at(-1);
		head.type = SNAKE;
		const nextX = head.x + ({ L: -1, R: 1 }[dir] || 0);
		const nextY = head.y + ({ U: -1, D: 1 }[dir] || 0);
		const nextCell = CELL_MAP[[nextX, nextY].join()];
		
		if (!nextCell || (nextCell.type === SNAKE && nextCell !== tail)) {
			gameOver();
			return;
		}else if (nextCell.type === FRUIT) {
			score++;
			genFruit();
		} else {
			tail.type = EMPTY;
			snake.shift();
		}
		
		nextCell.type = SNAKE_HEAD;
		snake.push(nextCell);
	}
	
	const gameOver = () => {
		isGameOver = true;
		$main.classList.add('finished');
	}
	
	const tick = (() => {
		let lastUpdate = 0;
		const check = () => {
			const now = Date.now();
			if (now >= lastUpdate + (1e3 / tps) && started) {
				tick();
				lastUpdate = now;
			}
			requestAnimationFrame(check);
		}
		
		check();
		return () => {
			if (isGameOver) return;
			advance();
			render();
		};
	})();
	
	$restart.addEventListener('click', init);
	$main.addEventListener('click', () => started = true);
	
	init();
})();