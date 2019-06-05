window.onload = () => {
    console.log("windows onload");

    // window.electronIpcRenderer.on("async_message", (event, data) => {
    //     console.log("web response[async_message]", data);
    // });

    // setTimeout(() => {
    //     console.log("interaction begin...");
    //     window.electronIpcRenderer.send("async_message", { name: "hello", age: 20 });
    // }, 3000);

    // setTimeout(() => {
    //     console.log("add user");
    //     window.okrobot.user.add("b", "hello", "hello key", "hello secret")
    //         .then(result => {
    //             console.log("okrobot add user success:", result);
    //         })
    //         .catch(error => {
    //             console.log("okrobot add user error:", error);
    //         });
    // }, 2000);

    // setTimeout(() => {
    //     console.log("query unexists user");
    //     window.okrobot.user.get("hello world")
    //         .then(result => {
    //             console.log("okrobot get user success:", result);
    //         })
    //         .catch(error => {
    //             console.log("okrobot get user failure:", error);
    //         });
    // }, 3000);

    // setTimeout(() => {
    //     console.log("obrobotlib test");

    //     window.okrobot.user.getAll()
    //         .then(result => {
    //             console.log("okrobotlib success:", result);
    //         })
    //         .catch(error => {
    //             console.log("okrobotlib error:", error);
    //         });
    // }, 10000);

    setTimeout(() => {
        console.log("automaker.init test");
        window.okrobot.auto_maker.init({
            type: 0,
            topPrice: 10,
            bottomPrice: 100,
            intervalTime: 2000,
            startVolume: 1,
            endVolume: 1,
            tradeType: 1,
            tradeLimit: 1
        }, {
                name: "h",
                httpKey: "e",
                httpSecret: "l",
                passphrase: "l"
            })
            .then(result => {
                console.log("[automaker.init] result:", JSON.stringify(result));
            })
            .catch(error => {
                console.log("[automaker.init] error:", error);
            });
    }, 2000);

    setTimeout(() => {
        console.log("automaker.start test");
        window.okrobot.auto_maker.start()
            .then(result => {
                console.log("[automaker.start] result:", JSON.stringify(result));
            })
            .catch(error => {
                console.log("[automaker.start] error:", error);
            });
    }, 3000);
};