export const sprite = [
  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7],
  [7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7],
  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6],
  [6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6],
  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7],
  [7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7],
  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6],
  [6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6],
  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7],
  [7, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 6, 7],
  [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
]

export const createCube = (size, colorIndex) => {
  const array3D = new Array(size)
  for (var i = 0; i < array3D.length; i++) {
    array3D[i] = new Array(size)
    for (var j = 0; j < array3D[i].length; j++) {
        array3D[i][j] = new Array(size)
    }
  }

  // Fill the 3D array with the value 6
  for (var i = 0; i < array3D.length; i++) {
    for (var j = 0; j < array3D[i].length; j++) {
      for (var k = 0; k < array3D[i][j].length; k++) {
        array3D[i][j][k] = colorIndex
      }
    }
  }

  return array3D
}

export const project2DArrayOnto3DArray = (array2D, array3D) => {
  // Project the values of array2D onto the front face of array3D
  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[i].length; j++) {
      array3D[0][i][j] = array2D[i][j]
    }
  }

  // Project the values of array2D onto the back face of array3D
  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[i].length; j++) {
      array3D[array3D.length - 1][i][j] = array2D[i][j]
    }
  }

  // Project the values of array2D onto the top face of array3D
  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[i].length; j++) {
      array3D[i][0][j] = array2D[i][j]
    }
  }

  // Project the values of array2D onto the bottom face of array3D
  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[i].length; j++) {
      array3D[i][array3D[i].length - 1][j] = array2D[i][j]
    }
  }

  // Project the values of array2D onto the left face of array3D
  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[i].length; j++) {
      array3D[i][j][0] = array2D[i][j]
    }
  }

  // Project the values of array2D onto the right face of array3D
  for (var i = 0; i < array2D.length; i++) {
    for (var j = 0; j < array2D[i].length; j++) {
      array3D[i][j][array3D[i][j].length - 1] = array2D[i][j]
    }
  }
}
