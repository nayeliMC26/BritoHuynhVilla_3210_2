const fragment = /* glsl*/ `
in float rand;

void main() {
    gl_FragColor = vec4(0.0, rand, 1.0-rand, 1.0);
} 
`;
export default fragment