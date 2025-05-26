# 🌐 AetherNet-DRFS

AetherNet-DRFS (Decentralized Redundant File System) is a modular, self-healing, and fault-tolerant file storage system designed for resilience and security. It combines Reed-Solomon erasure coding, AES-256 encryption, and a Distributed Hash Table (DHT) to distribute and manage files across dynamically connected peers.

> 🔐 Secure. 🔄 Redundant. ⚙️ Decentralized.

---

## 🚀 Features

- 🧮 **Reed-Solomon Erasure Coding** — Ensures data recoverability even if some chunks are lost.
- 🔒 **AES-256 Encryption** — Military-grade encryption per chunk for enhanced security.
- 📡 **Dynamic Peer Registration** — Peers can join/leave the network at any time.
- 🔁 **Heartbeat Monitoring** — Real-time liveness detection of peers.
- 🔁 **Redundant Storage** — Parity chunks provide fault tolerance and automatic recovery.
- 📂 **Local Storage** — All data/parity stored on file system, no external DBs.
- 📎 **Auto Cleanup** — Automatically removes encrypted files after distribution.
- 🖥️ **API-Based Architecture** — Controlled via backend APIs for extensibility.
- 🗂️ **Folder Structure Per Peer** — Runs multiple peers simultaneously on same machine.

---

## 📁 Project Structure

```
AetherNet-DRFS/
├── master/
│ ├── config/
│ ├── core/
│ ├── peer-interface/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ └── index.js
│
├── peer/
│ ├── config/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ └── index.js
│
└── README.md
```

---

## ⚙️ How It Works

### 🔁 Workflow

1. **User uploads file** via file explorer to the master node.
2. **Master node chunks** the file using Reed-Solomon (6 data + 3 parity by default) and then encrypts using AES-256-GCM.
3. **Chunks are distributed to peers** using a round-robin algorithm.
4. **Each peer stores chunks locally** in its `data` or `parity` directory.
5. **Heartbeat mechanism** keeps track of which peers are alive.
6. **Chunks can be requested and reconstructed** even if some peers go offline.

---

## 🔧 Tech Stack

| Component       | Technology            |
|----------------|------------------------|
| Backend Runtime| Node.js (ESModules)   |
| Networking     | Express.js APIs       |
| Security       | AES-256 GCM Encryption |
| Redundancy     | Reed-Solomon JS       |
| Storage        | Default File System    |
| Monitoring     | Heartbeat System      |

> 🧠 Note: No external databases are used. All mappings and logs are file-based.

---

## ⚙️ Configuration

- **Data/Parity Count**: `6` data chunks + `3` parity chunks per file.
- **Heartbeat Interval**:
  - Peers → Master: every **10 seconds**
  - Master marks peer offline if no ping in **30 seconds**
- **Storage Path** (Can be customized):
  - Master Upload Folder: `master/user-uploads`
  - Master registry: `master/persistent/peer-registry.json`
  - Master DHT: `master/persistent/dht-mapping.json`
  - Peer-specific chunk folders: `peer/storage/peer-01/data` and `parity`

---

## 🧪 How to Run

### 1. Master

(Copy .env.example to .env and/or customize variables)
```bash
cd master
npm install
node index.js
```

### 2. Peers (Can run multiple)

```bash
cd peer
npm install
NODE_ID=peer-01 PORT=4001 STORAGE_FOLDER=storage/peer-01 node index.js
NODE_ID=peer-02 PORT=4002 STORAGE_FOLDER=storage/peer-02 node index.js
```
(Can also use pre-defined scripts in package.json)

> Each peer will create its own storage folders and automatically register with the master.

---

## 🧑‍💻 Contributors

- 👨‍💻 **Devik Gupta**
- 👨‍💻 **Navalpreet Kaur**
- 👨‍💻 **Abhishek Patwal**
- 👨‍💻 **Priya Bahuguna**

---

## 📜 License

This project is licensed under the ISC License — a permissive license allowing reuse with minimal restrictions.

---

> Built with 🔥 by the AetherNet Team.
