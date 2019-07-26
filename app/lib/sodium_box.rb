# typed: true
require 'rbnacl'
require 'base64'

# Uses rbnacl/libsodium to encrypt strings using a shared secret.
# Expects secret to be base64 encoded, and wraps payloads in base64 too.
class SodiumBox
  def self.new_shared_secret64
    Base64.encode64(RbNaCl::Random.random_bytes(RbNaCl::SecretBox.key_bytes))
  end

  def initialize(shared_secret64)
    @box = RbNaCl::SimpleBox.from_secret_key(Base64.decode64(shared_secret64))
  end

  def encrypt64(string)
    Base64.encode64(@box.encrypt(string))
  end

  def decrypt64(payload64)
    @box.decrypt(Base64.decode64(payload64))
  end
end
