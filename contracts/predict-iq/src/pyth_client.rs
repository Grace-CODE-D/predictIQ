use soroban_sdk::{contractclient, BytesN, Env};

#[contractclient(name = "PythOracle")]
pub trait PythOracleInterface {
    fn get_price(env: Env, feed_id: BytesN<32>) -> (i64, u64, i32, i64);
}
