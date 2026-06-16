
// JWE Protected Header Structure
export interface JWEHeader {
  alg: 'dir' | 'RSA-OAEP-256' | 'ECDH-ES'; // Restricting to supported algs
  enc: 'A256GCM' | 'A128GCM';
  typ?: 'JWT';
  cty?: 'JWT';
}