/**
*
* The utility method can be used to validate/verify the signed request. 
* In this case, the signed request is verified that it's from Salesforce and that 
* it has not been tampered with.
* 
* This utility class has two methods. One verifies and decodes the request
* as a Java object, the other as a JSON String.
*
*/
public class SignedRequest {
    
    public static String verifyAndDecodeAsJson(String input, String secret) {
        String[] split = getParts(input);
        String encodedSig = split[0];
        String encodedEnvelope = split[1];
        Blob bEnv = EncodingUtil.base64Decode(encodedEnvelope);
        String sJson = benv.toString(); 
        return sJson;
    }

    private static String[] getParts(String input) {
        String[] split = input.split('[.]', 2);
        return split;
    }

   /* private static void verify(String secret, String algorithm, 
        String encodedEnvelope, String encodedSig ) 
    {
  
        SecretKey hmacKey = null;
        try {
            byte[] key = secret.getBytes();
            hmacKey = new SecretKeySpec(key, algorithm);
            Mac mac = Mac.getInstance(algorithm);
            mac.init(hmacKey);
            // Check to see if the body was tampered with.
            byte[] digest = mac.doFinal(encodedEnvelope.getBytes());
            byte[] decode_sig = new Base64(true).decode(encodedSig);
            if (! Arrays.equals(digest, decode_sig)) {
                String label = 'Warning: Request was tampered with';
                throw new SecurityException(label);
            }
        } catch (NoSuchAlgorithmException e) {
            throw new SecurityException(String.format('Problem with algorithm [%s] 
                Error [%s]', algorithm, e.getMessage()), e);
        } catch (InvalidKeyException e) {
            throw new SecurityException(String.format('Problem with key [%s] 
            Error [%s]', hmacKey, e.getMessage()), e);
        }
        // If we got here and didn't throw a SecurityException then all is good.
    } */
}