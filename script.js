// if you spam an s-piece to the right or a z-piece to the left at spawn the game starts over?

























// Solve ↑

// CONSTS //

const START_DROP_MS = 300
const MOVE_MS = 90
const DROP_ACCELERATION = 20

const WIDTH = 10
const HEIGHT = 20

const WIDTH_PX = 250
const CELL_PX = WIDTH_PX / WIDTH
const HEIGHT_PX = HEIGHT * CELL_PX

let high_score = localStorage.getItem("highscore")

if (high_score == null) {
	localStorage.setItem("highscore", 0)
	high_score = 0
}

let held_grid = []
let old_held = []

// CANVAS //

const game_canvas = document.getElementById("game-canvas")

let next_container = document.getElementById("next-container")
let hold_container = document.getElementById("hold-container")

let next_canvas = document.getElementById("next")
let hold_canvas = document.getElementById("hold")

game_canvas.width = WIDTH_PX
game_canvas.height = HEIGHT_PX

next_container.style.width = 6 * CELL_PX + "px"
next_container.style.height = 6 * CELL_PX + "px"

hold_container.style.width = 6 * CELL_PX + "px"
hold_container.style.height = 6 * CELL_PX + "px"

// GAME //

// source: https://stackoverflow.com/questions/16512182/how-to-create-empty-2d-array-in-javascript
let board = [...Array(HEIGHT)].map(e => Array(WIDTH).fill(0))
// end source

const color_levels = [
	["#2c2e3a", "#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"],
	["#000000", "#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#ffc6ff"],
	["#000000", "#007bff", "#0091f7", "#00a7ef", "#00bde8", "#00d3e0", "#00e9d8", "#00ffd0"],
]

let level = 0
let colors = color_levels[level]

let level_display = document.getElementById("level-display")
let high_score_display = document.getElementById("high-score-display")

const pieces = [
	[
		[1, 1],
		[1, 1]
	],
	[
		[2, 2, 2, 2],
	],
	[
		[0, 3, 3],
		[3, 3, 0]
	],
	[
		[4, 4, 0],
		[0, 4, 4]
	],
	[
		[0, 0, 5],
		[5, 5, 5]
	],
	[
		[6, 0, 0],
		[6, 6, 6]
	],
	[
		[0, 7, 0],
		[7, 7, 7]
	]
]

function draw_cell(x, y, type, canvas, transparent = false) {
	let ctx = canvas.getContext("2d")

	if (transparent) {
		ctx.fillStyle = colors[type] + "33"
	} else {
		ctx.fillStyle = colors[type]
	}

	ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX)
}

function draw() {
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			let player_tile = 0

			try {
				player_tile = player_grid[y - player_y][x - player_x]
			} catch {
				player_tile = 0
			}

			if (player_tile == 0 || player_tile == undefined) {
				draw_cell(x, y, board[y][x], game_canvas)
			} else {
				draw_cell(x, y, player_grid[y - player_y][x - player_x], game_canvas)
			}
		}
	}

	// ghost piece
	let dx = player_x
	let dy = player_y + get_distance()

	for (let y = 0; y < player_grid.length; y++) {
		for (let x = 0; x < player_grid[0].length; x++) {
			draw_cell(dx + x, dy + y, player_grid[y][x], game_canvas, true)
		}
	}
}

function is_colliding(background, foreground, dx, dy) {
	for (let y = 0; y < foreground.length; y++) {
		for (let x = 0; x < foreground[0].length; x++) {
			if (dy + y < 0) {
				continue
			}

			if (dx < 0 || dx + foreground[0].length > WIDTH) {
				return true
			}

			try {
				if (foreground[y][x] != 0 && background[dy + y][dx + x] != 0) {
					return true
				}
			} catch {
				return true
			}
		}
	}

	return false
}

// source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	return array
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
}
// end source

function draw_piece(piece_grid, canvas) {
	if (piece_grid.length == 0) {
		return
	}

	canvas.height = piece_grid.length * CELL_PX
	canvas.width = piece_grid[0].length * CELL_PX

	for (let y = 0; y < piece_grid.length; y++) {
		for (let x = 0; x < piece_grid[0].length; x++) {
			draw_cell(x, y, piece_grid[y][x], canvas)
		}
	}
}

function spawn_piece(piece) {
	if (piece == undefined || piece.length == 0) {
		if (bag.length == pieces.length) {
			bag = shuffle(pieces).concat(bag)
		}
	
		player_grid = bag.pop()
	} else {
		player_grid = piece
	}

	player_x = Math.floor(WIDTH/2) - Math.ceil(player_grid[0].length / 2)
	player_y = -2

	if (Math.max(...board[0]) != 0) {
		board = [...Array(HEIGHT)].map(e => Array(WIDTH).fill(0))
		level = 0
		update_level()
	}

	draw_piece(bag[bag.length - 1], next_canvas)
}

function overlay(background, foreground, dx, dy) {
	let overlayed = background

	for (let y = 0; y < foreground.length; y++) {
		for (let x = 0; x < foreground[0].length; x++) {
			if (foreground[y][x] != 0) {
				try {
					overlayed[dy + y][dx + x] = foreground[y][x]
				} catch {
					console.log(":)")
				}
			}
		}
	}

	return overlayed
}

function move(x) {
	if (is_colliding(board, player_grid, player_x + x, player_y)) {
		return
	} else {
		player_x += x
	}
}

function rotate() {
	// source: chatGPT
	const rotated_grid = player_grid[0].map((_, index) =>
		player_grid.map(row => row[index]).reverse()
	)
	// end source

	if (is_colliding(board, rotated_grid, player_x, player_y)) {
		return
	} else {
		player_grid = rotated_grid
	}

}

function update_level() {
	if (level > high_score) {
		high_score = level
		localStorage.setItem("highscore", String(level))
	}
	
	drop_ms = START_DROP_MS - level * DROP_ACCELERATION

	high_score_display.textContent = "High score: " + String(parseInt(high_score) + 1)

	colors = color_levels[level % color_levels.length]

	hold_container.style.backgroundColor = colors[0]
	next_container.style.backgroundColor = colors[0]

	level_display.textContent = "Level: " + String(level + 1)

	draw_piece(bag[bag.length - 1], next_canvas)
	draw_piece(held_grid, hold_canvas)
}

function clear_rows() {
	let cleared = 0
	for (let y = 0; y < HEIGHT; y++) {
		if (Math.min(...board[y]) != 0) {
			board.splice(y, 1)
			board = [Array(WIDTH).fill(0)].concat(board)
			cleared += 1;
		}
	}

	if (cleared == 4) {
		level += 1
		drop_ms -= DROP_ACCELERATION
		update_level()
	}
}

function get_distance() {
	let distance = 0

	while (!is_colliding(board, player_grid, player_x, player_y + distance + 1)) {
		distance += 1
	}

	return distance
}

function hold() {
	swapped = true

	old_held = held_grid

	held_grid = player_grid

	spawn_piece(old_held)
	drop_timer = drop_ms
	update_level()
}

// MAIN LOOP //

let drop_ms = START_DROP_MS

let player_x = 10
let player_y = 0
let player_grid = []

let delta = 0
let last_frame_time = 0
let drop_timer = drop_ms

let move_timer = MOVE_MS

let swapped = false

function frame(time) {
	delta = time - last_frame_time
	last_frame_time = time

	drop_timer -= delta

	let move_direction = keys_down.includes("ArrowRight") - keys_down.includes("ArrowLeft")

	if (new_keys_down.includes("ArrowRight") || new_keys_down.includes("ArrowLeft")) {
		move_timer = 0
	}

	if (move_direction != 0) {
		move_timer -= delta

		if (move_timer <= 0) {
			move(move_direction)

			move_timer = MOVE_MS
		}
	}

	if (new_keys_down.includes("ArrowUp")) {
		rotate()
	}

	if ((new_keys_down.includes("c") || new_keys_down.includes("C")) && swapped == false) {
		hold()
	}

	if (keys_down.includes("ArrowDown")) {
		drop_timer = 0
	}

	if (new_keys_down.includes(" ")) {
		player_y += get_distance()
		drop_timer = 0
	}

	if (drop_timer <= 0) {
		if (is_colliding(board, player_grid, player_x, player_y + 1)) {
			board = overlay(board, player_grid, player_x, player_y)
			spawn_piece()
			swapped = false
		} else {
			player_y += 1
		}

		drop_timer = drop_ms
	}

	clear_rows()
	draw()

	new_keys_down = []

	requestAnimationFrame(frame)
}

// document.addEventListener("keydown", function(event) {
// 	switch (event.key) {
// 		case "ArrowDown":
// 			drop_timer = 0
// 			break
// 		case "ArrowRight":
// 			move(1)
// 			break
// 		case "ArrowLeft":
// 			move(-1)
// 			break
// 		case "ArrowUp":
// 			rotate()
// 			break
// 		case " ":
// 			drop()
// 			break
// 		case "c":
// 			hold()
// 			break
// 	}
// })

// let right = false
// let left = false
// let down = false

// document.addEventListener("keydown", function(event) {
// 	switch (event.key) {
// 		case "ArrowDown":
// 			down = true
// 			break
// 		case "ArrowRight":
// 			right = true
// 			break
// 		case "ArrowLeft":
// 			left = true
// 			break
// 	}
// })

// document.addEventListener("keyup", function(event) {
// 	switch(event.key) {
// 		case "ArrowDown":
// 			down = false
// 			break
// 		case "ArrowRight":
// 			right = false
// 			break
// 		case "ArrowLeft":
// 			left = false
// 			break

// 	}
// })

let keys_down = []
let new_keys_down = []

document.addEventListener("keydown", function(event) {
	if (!keys_down.includes(event.key)) {
		keys_down.push(event.key)
		new_keys_down.push(event.key)
	}
})

document.addEventListener("keyup", function(event) {
	let i = keys_down.indexOf(event.key)
	if (i != -1) {
		keys_down.splice(i, 1)
	}
})

let bag = shuffle(pieces)

spawn_piece()
frame(0)
update_level()