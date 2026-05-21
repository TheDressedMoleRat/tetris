// CONSTS //

const DROP_MS = 200

const WIDTH = 10
const HEIGHT = 20

const WIDTH_PX = 400
const CELL_PX = WIDTH_PX / WIDTH
const HEIGHT_PX = HEIGHT * CELL_PX

// CANVAS //

let game_canvas = document.getElementById("game-canvas")
let ctx = game_canvas.getContext("2d")
game_canvas.width = WIDTH_PX
game_canvas.height = HEIGHT_PX

// GAME //

// source: https://stackoverflow.com/questions/16512182/how-to-create-empty-2d-array-in-javascript
let board = [...Array(HEIGHT)].map(e => Array(WIDTH).fill(0))
// end source

const color_levels = [
	["#14151b", "#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"],
	["#000000", "#007bff", "#0091f7", "#00a7ef", "#00bde8", "#00d3e0", "#00e9d8", "#00ffd0"],
	["#897fbe", "#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#ffc6ff"],
]

let level = 0
let colors = color_levels[level]

const pieces = [
	[
		[1, 1],
		[1, 1]
	],
	[
		[2, 2, 2, 2]
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

function draw_cell(x, y, type) {
	ctx.fillStyle = colors[type]
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
				draw_cell(x, y, board[y][x])
			} else {
				draw_cell(x, y, player_grid[y - player_y][x - player_x])
			}
		}
	}
}

function is_colliding(background, foreground, dx, dy) {
	for (let y = 0; y < foreground.length; y++) {
		for (let x = 0; x < foreground[0].length; x++) {
			if (dy + y < 0) {
				continue
			}

			if (HEIGHT - (foreground.length + dy) < 0) {
				return true
			}
			
			if (foreground[y][x] != 0 && background[dy + y][dx + x] != 0) {
				return true
			}
		}
	}

	return false
}

function spawn_piece() {
	player_grid = pieces[Math.floor(Math.random() * 7)]

	player_x = Math.floor(WIDTH/2) - Math.floor(player_grid[0].length / 2)
	player_y = -2

	if (Math.max(...board[0]) != 0) {
		board = [...Array(HEIGHT)].map(e => Array(WIDTH).fill(0))
		colors = base_colors
	}
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
		colors = color_levels[level % color_levels.length]
	}
}

function drop() {
	while (!is_colliding(board, player_grid, player_x, player_y + 1)) {
		player_y += 1
	}
}

// MAIN LOOP //

let player_x = 10
let player_y = 0
let player_grid = []

let delta = 0
let last_frame_time = 0
let drop_timer = DROP_MS

function frame(time) {
	delta = time - last_frame_time
	last_frame_time = time

	drop_timer -= delta

	if (drop_timer <= 0) {
		if (is_colliding(board, player_grid, player_x, player_y + 1)) {
			board = overlay(board, player_grid, player_x, player_y)
			spawn_piece()
		} else {
			player_y += 1
		}
		
		drop_timer = DROP_MS
	}

	clear_rows()
	draw()

	requestAnimationFrame(frame)
}

document.addEventListener("keydown", function(event) {
	switch (event.key) {
		case "ArrowDown":
			drop_timer = 0
			break
		case "ArrowRight":
			move(1)
			break
		case "ArrowLeft":
			move(-1)
			break
		case "ArrowUp":
			rotate()
			break
		case " ":
			drop()
			break
	}
})

spawn_piece()
frame(0)