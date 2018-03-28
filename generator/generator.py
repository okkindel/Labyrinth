import pygame
import sys

FRONT = (50, 50, 50)
BACK = (200, 200, 200)
SPAWN = (30, 80, 30)
BLOCK_1 = (162, 81, 63)
BLOCK_2 = (162, 100, 63)
BLOCK_3 = (162, 120, 63)

# This sets the WIDTH and HEIGHT of each grid location
WIDTH = 20
HEIGHT = 20
MARGIN = 2

num_of_rows = 0
num_of_cols = 0

while num_of_cols < 1:
    num_of_cols = int(input("Enter map width: "))
    if num_of_cols < 1:
        print("There must be more cells.")
while num_of_rows < 1:
    num_of_rows = int(input("Enter map height: "))
    if num_of_rows < 1:
        print("There must be more cells.")

grid = []
for row in range(20):
    grid.append([])
    for column in range(27):
        grid[row].append(0)

# spawn_x = int(input("Enter spawn X: "))
# spawn_y = int(input("Enter spawn Y: "))
# grid[spawn_y][spawn_x] = "spawn"

pygame.init()
WINDOW_SIZE = [((MARGIN + WIDTH) * (num_of_cols + 1)) + 2, ((MARGIN + HEIGHT) * (num_of_rows + 1)) + 2]
screen = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption("Map Generator")
done = False
clock = pygame.time.Clock()

tile_choosen = 0
while not done:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True
        elif event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            if pos[0] < ((MARGIN + WIDTH) * (num_of_cols + 1)) and pos[1] < ((MARGIN + HEIGHT) * (num_of_rows + 1)):
                try:
                    if pos[0] < ((MARGIN + WIDTH) * num_of_cols) and pos[1] < ((MARGIN + HEIGHT) * num_of_rows):
                        column = pos[0] // (WIDTH + MARGIN)
                        row = pos[1] // (HEIGHT + MARGIN)
                        if grid[row][column] != 'spawn':
                            if grid[row][column] != tile_choosen:
                                grid[row][column] = tile_choosen
                            elif grid[row][column] == tile_choosen:
                                grid[row][column] = 0
                            print("Changed ", pos, "on coordinates: ", row, column)
                    if ((MARGIN + WIDTH) * num_of_cols) < pos[0] < ((MARGIN + WIDTH) * (num_of_cols + 1)) and pos[
                        1] < ((MARGIN + HEIGHT) * num_of_rows):
                        column_tiles = pos[0] // (WIDTH + MARGIN)
                        row_tiles = pos[1] // (HEIGHT + MARGIN)
                        tile_choosen = grid[row_tiles][column_tiles]
                    elif 0 < pos[0] < ((MARGIN + WIDTH) * (num_of_cols + 1)) and ((MARGIN + HEIGHT) * num_of_rows) < \
                            pos[1] < ((MARGIN + HEIGHT) * (num_of_rows + 1)):
                        map_save()
                except IndexError:
                    print("Out of bound exception, try again")
    screen.fill(BACK)

    # Draw the gridtile_choosen
    for row in range(num_of_rows):
        for column in range(num_of_cols):
            color = FRONT
            if grid[row][column] == "spawn":
                color = SPAWN
            if grid[row][column] == 1:
                color = BLOCK_1
            if grid[row][column] == 2:
                color = BLOCK_2
            if grid[row][column] == 3:
                color = BLOCK_3
            pygame.draw.rect(screen, color, [(MARGIN + WIDTH) * column + MARGIN,
                                             (MARGIN + HEIGHT) * row + MARGIN, WIDTH, HEIGHT])

    grid[0][num_of_cols] = 0
    grid[1][num_of_cols] = 1
    grid[2][num_of_cols] = 2
    grid[3][num_of_cols] = 3

    for row in range(0, 4):
        if grid[row][num_of_cols] == 0:
            color = FRONT
        if grid[row][num_of_cols] == 1:
            color = BLOCK_1
        if grid[row][num_of_cols] == 2:
            color = BLOCK_2
        if grid[row][num_of_cols] == 3:
            color = BLOCK_3

        if grid[row][num_of_cols] == tile_choosen:
            pygame.draw.rect(screen, (255, 255, 255), [(MARGIN + WIDTH) * num_of_cols + 1 + MARGIN,
                                                       (MARGIN + HEIGHT) * row + MARGIN, WIDTH, HEIGHT])
        pygame.draw.rect(screen, color, [(MARGIN + WIDTH) * num_of_cols + 1 + 2 + MARGIN,
                                         (MARGIN + HEIGHT) * row + 2 + MARGIN, WIDTH - 4, HEIGHT - 4])

    pygame.draw.rect(screen, FRONT,
                     [2, ((MARGIN + HEIGHT) * (num_of_rows)) + 2, ((MARGIN + WIDTH) * (num_of_cols + 1)) - 2, 20])
    label = pygame.font.SysFont("monospace", 15).render(
        "GENERATE", 1, (255, 255, 255))
    screen.blit(label, (((MARGIN + WIDTH) * (num_of_cols + 1) / 2) - 30, ((MARGIN + HEIGHT) * (num_of_rows)) + 4))


    def map_save():
        for row in range(num_of_rows):
            print("[", end='', sep='')
            for column in range(num_of_cols):
                print(grid[row][column], ", ", end='', sep='')
            if row != (num_of_cols - 1):
                print("],")
            else:
                print("]")


    clock.tick(60)
    pygame.display.flip()

pygame.quit()
