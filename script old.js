// CONSTS //

const DROP_MS = 500

const WIDTH = 10
const HEIGHT = 20

const WIDTH_PX = 400
const CELL_PX = WIDTH_PX / WIDTH
const HEIGHT_PX = HEIGHT * CELL_PX

// CANVAS //

const game_canvas = document.createElement("canvas")
document.body.appendChild(game_canvas)
let ctx = game_canvas.getContext("2d")
game_canvas.width = WIDTH_PX
game_canvas.height = HEIGHT_PX

// GAME //

const board = [...Array(HEIGHT)].map(e => Array(WIDTH).fill(0))

const colors = ["#14151b", "#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"]

const pieces = [
	[
		[1, 1],
		[1, 1]
	],
	[
		[2],
		[2],
		[2],
		[2]
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
		[5, 0],
		[5, 0],
		[5, 5]
	],
	[
		[0, 6],
		[0, 6],
		[6, 6]
	],
	[
		[7, 7, 7],
		[0, 7, 0]
	]
]

function draw_cell(x, y, type) {
	ctx.fillStyle = colors[type]
	ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX)
}

function draw_grid(grid) {
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			draw_cell(x, y, board[y][x])
		}
	}
}

function overlay(background, foreground, dx, dy) {
	let overlayed = background

	for (let y = 0; y < foreground.length; y++) {
		for (let x = 0; x < foreground[0].length; x++) {
			if (foreground[y][x] != 0) {
				overlayed[dy + y][dx + x] = foreground[y][x]
			}
		}
	}

	return overlayed
}

function is_colliding(background, foreground, dx, dy) {
	for (let y = 0; y < foreground.length; y++) {
		for (let x = 0; x < foreground[0].length; x++) {
			if (foreground[y][x] != 0 && background[dy + y][dx + x] != 0) {
				return true
			} else {
				return false
			}
		}
	}
}

function spawn_piece() {
	player_grid = pieces[Math.floor(Math.random() * 7)]

	player_x = Math.floor(WIDTH/2) - Math.floor(player_grid[0].length / 2)
	player_y = 0
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
		player_y += 1

		drop_timer = DROP_MS
	}

	draw_grid(overlay(board, player_grid, player_x, player_y))
	requestAnimationFrame(frame)
}

spawn_piece()
frame(0)