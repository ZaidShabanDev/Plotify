precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uBackOpacity;
uniform float uRadius;

attribute vec3 position;

varying float vOpacity;

void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 viewCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    // valid only while the sphere is centered at the object origin
    vec3 viewNormal = normalMatrix * normalize(position);
    vec3 toCamera = normalize(-viewPosition.xyz);

    float facing = dot(viewNormal, toCamera);
    float facingVisibility = smoothstep(-1.0, 1.0, facing);
    float cameraDistance = length(viewCenter.xyz);
    float outsideWeight = smoothstep(uRadius - 0.1, uRadius, cameraDistance);
    float visibility = mix(1.0, facingVisibility, outsideWeight);
    vOpacity = mix(uBackOpacity, 1.0, visibility);

    gl_Position = projectionMatrix * viewPosition;
}