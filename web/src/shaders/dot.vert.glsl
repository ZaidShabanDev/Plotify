precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uBackOpacity;
uniform float uRadius;

attribute vec3 position;
attribute float aSize;

varying float vOpacity;

float sphereFadeOpacity(vec3 position, vec4 viewPosition, mat4 modelViewMatrix, mat3 normalMatrix, float radius, float backOpacity);

void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vOpacity = sphereFadeOpacity(position, viewPosition, modelViewMatrix, normalMatrix, uRadius, uBackOpacity);

    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = 20.0 / (-viewPosition.z) * aSize;
}