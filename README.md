
## Minestrone -- a lightweight client for RTXP networks.

So far, it only supports reading from the ledger. There's no cryptography included, no signatures, no transactions.

Basic Usage
-----------

At its simplest, just add the script to the HTML file

```<script src="minestrone.js"></script>```

This exports a minestrone-object, which currently only exposes the Remote() constructor, for creating a connection to a remote RTXP server.

To get the account_info of 'account':

```
var account = 'rrrrrrrrrrrrrrrrrrrrBZbvji';
var remote = new minestrone.Remote('wss://s-west.ripple.com:443');
remote.get_account_info(account).then(console.log);
```

Subscriptions
-------------

At the moment, subscriptions work by registering a callback with a specific transaction type.

If you want to subscribe to payment tx's to 'account', this is how you'd do it:

```
function parse_payment(res) {
	...
};

remote.add_callback('Payment', parse_payment);
remote.subscribe({accounts: [account]});
```

IE Users
--------

Minestrone uses promises, so if you're supporting IE you'll need a polyfill,
e.g. https://github.com/taylorhakes/promise-polyfill.

```
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE9">
<!--[if IE]><script src="promise.js"></script><![endif]-->
```
