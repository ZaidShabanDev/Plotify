precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uBackOpacity;
uniform float uRadius;
uniform float uMinRelationOpacity;

attribute vec3 position;
attribute float aWeight;

varying float vOpacity;

float sphereFadeOpacity(vec3 position, vec4 viewPosition, mat4 modelViewMatrix, mat3 normalMatrix, float radius, float backOpacity);

void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float weightOpacity = mix(uMinRelationOpacity, 1.0, aWeight);
    vOpacity = sphereFadeOpacity(position, viewPosition, modelViewMatrix, normalMatrix, uRadius, uBackOpacity) * weightOpacity;

    gl_Position = projectionMatrix * viewPosition;
}