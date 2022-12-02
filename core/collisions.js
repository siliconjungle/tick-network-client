export const rectanglesOverlap = (rect, rect2) => {
  return (
    rect.position.x + rect.size.width >= rect2.position.x &&
    rect.position.x < rect2.position.x + rect2.size.width &&
    rect.position.y + rect.size.height >= rect2.position.y &&
    rect.position.y < rect2.position.y + rect2.size.height
  )
}

export const circleOverlapsRectangle = (circle, rect) => {
  const circleDistance = {
    x: Math.abs(circle.position.x - rect.position.x),
    y: Math.abs(circle.position.y - rect.position.y),
  }

  if (circleDistance.x > rect.width * 0.5 + circle.radius) {
    return false
  }

  if (circleDistance.y > rect.height * 0.5 + circle.radius) {
    return false
  }

  if (circleDistance.x <= rect.width * 0.5) {
    return true
  }

  if (circleDistance.y <= rect.height * 0.5) {
    return true
  }

  const cornerDistanceSq =
    Math.pow(circleDistance.x - rect.width * 0.5, 2) +
    Math.pow(circleDistance.y - rect.height * 0.5, 2)

  return cornerDistanceSq <= Math.pow(circle.radius, 2)
}

export const circlesOverlap = (circle, circle2) => {
  return (
    Math.hypot(
      circle.position.x - circle2.position.x,
      circle.position.y - circle2.position.y
    ) <=
    circle.radius + circle2.radius
  )
}

export const pointInSphere = ({ position, radius }, point) => {
  const diff = {
    x: Math.abs(position.x - point.x),
    y: Math.abs(position.y - point.y),
    z: Math.abs(position.z - point.z),
  }

  return diff.x * diff.x + diff.y * diff.y + diff.z * diff.z <= radius * radius
    ? 1
    : 0
}

export const pointInCircle = ({ position, radius }, point) => {
  const diff = {
    x: Math.abs(position.x - point.x),
    z: Math.abs(position.z - point.z),
  }

  return diff.x * diff.x + diff.z * diff.z <= radius * radius ? 1 : 0
}
