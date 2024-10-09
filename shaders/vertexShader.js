const vertex = /* glsl */ `
uniform float deltaX;
uniform float deltaY;
uniform float deltaZ;
out float rand; 

float random( vec2 p )
{
    vec2 K1 = vec2(
        23.14069263277926, // e^pi (Gelfond's constant)
         2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
    );
    return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main() {
    rand = random( vec2( position.x, position.y ) );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + deltaX, position.y + deltaY, position.z, 1.0); 
}
`;
export default vertex;