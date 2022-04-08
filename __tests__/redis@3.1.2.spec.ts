import { exec } from "child_process";
import { assert } from "console";
import { execPath } from "process";
import * as redis from "redis";

describe("redis", function () {
  this.timeout(30000);
  before(function (done) {
    exec("which docker", (err, stdout, stderr) => {
      if (err) {
        done(err);
        return;
      }

      exec(
        `docker run --rm -d -h redis -e REDIS_PASSWORD=test -p 8000:6379 --name=ts-sandbox-redis redis /bin/sh -c 'redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}'`,
        (err, stdout, stderr) => {
          if (err) {
            done(err);
            return;
          }

          done();
        }
      );
    });
  });

  it("Should run", function (done) {
    const client = redis.createClient({
      port: 8000,
      password: "test",
    });

    client.on("ready", () => {
      console.log("redis ready");
    });

    client.set("foo", "bar", (err: any) => {
      if (err) done(err);

      client.get("foo", (err: any, reply: any) => {
        if (err) done(err);

        assert(reply, "bar");
        done();
      });
    });
  });

  after(function (done) {
    exec("docker stop ts-sandbox-redis", (err, stdout, stderr) => {
      if (err) {
        done(err);
        return;
      }
      done();
    });
  });
});
