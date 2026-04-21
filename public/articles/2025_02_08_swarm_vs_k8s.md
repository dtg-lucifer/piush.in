---
title: "When Should You Use Kubernetes for Your Projects?"
seoTitle: "When to Use Kubernetes for Projects?"
seoDescription: "Choose Kubernetes for complex setups and scalability; opt for Docker Swarm for simplicity and quick deployment"
datePublished: Sat Feb 08 2025 18:49:10 GMT+0000 (Coordinated Universal Time)
cuid: cm6wjucc3002n08l4cku1h431
slug: when-should-you-use-kubernetes-for-your-projects
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1739040872235/71195afd-019f-437e-ab9d-b4a7e9ba954b.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1739040517788/0041905b-d1b5-41fb-b432-ffafa4d1d5e7.png
tags: cloud, docker, kubernetes, swarm, docker-swarm, cncf, cloud-native, docker-stack

---

> ### TL;DR
> 
> If you are not concerned about your deployments and don’t wanna dig dive into this then it’s okay. Anyways, this topic is a very trending topic in the market of blogs, but when i started learning all of these I did not catch the difference between those. I always wished that it would be graet if there is someone who can teach me all of this as I am a 5 year old. SO HERE IT IS

# Your Introduction to Orchestration

> ~ “Wait a second, you just said that you are going to explain us this as we are 5 year olds”  
> ~ Yes, i am gonna do that.

## So what is orchestration?

Basically its a pretty heavy word, you don’t need to memorise it, you can google it. All this means is **“the way you manage all of your containers and connect those in between and find a way to deploy the changes and rolling back to the previous versions in a very efficient and easy way”**

#### **Let’s see what ChatGPT says about this, or maybe i should use DeepSeek?**

<mark>Container orchestration has become a critical part of modern software deployment, enabling scalability, high availability, and efficient resource utilization. Kubernetes (K8s) and Docker Swarm are two of the most well-known container orchestration tools, each with its strengths and ideal use cases. However, with the growing dominance of Kubernetes, many teams find themselves asking: </mark> *<mark>Do we really need Kubernetes for everything?</mark>* <mark>In this blog, we’ll compare Kubernetes and Docker Swarm, highlighting their key differences, use cases, and when one might be a better fit than the other.</mark>

## Understanding the basics of K8s and Swarm

> ~ “but wait, what is **k8s** and **swarm**??”  
> ~ k8s is a very clever and nerdy way to name kubernetes, it is literally `k(sum of the other letters)s` which is ultimately ***k8s,*** and ***swarm*** is docker’s own orchestration tool which comes with docker pre installed. Isn’t it cool?? Try it by writing `docker swarm init`, it should give you an error saying that your ip is not publicly accessible.

### What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform initially developed by Google and now maintained by the Cloud Native Computing Foundation (CNCF). It automates the deployment, scaling, and management of containerized applications across clusters of machines. K8s provides powerful features such as self-healing, load balancing, automated rollouts, and extensive networking capabilities. However, it comes with a steep learning curve and requires significant setup and operational overhead.

### What is Docker Swarm?

Docker Swarm is Docker’s native container orchestration tool that allows users to manage a cluster of Docker nodes as a single virtual system. It is built into the Docker Engine, making it easier to set up and use compared to Kubernetes. Docker Swarm focuses on simplicity and quick deployment, offering features like automated load balancing, rolling updates, and service discovery. While it lacks some of Kubernetes' advanced capabilities, it remains a solid choice for smaller-scale applications where ease of use and quick setup are priorities.

## Now let’s compare the features of both

### **Ease of Setup**

* **Kubernetes**: Requires extensive configuration and setup.
    
* **Docker Swarm**: Simple and quick to initialize using Docker CLI.
    

### 2\. **Scalability**

* **Kubernetes**: Designed for large-scale, complex deployments.
    
* **Docker Swarm**: More suitable for smaller, less complex workloads.
    

### 3\. **High Availability & Fault Tolerance**

* **Kubernetes**: Built-in self-healing and auto-recovery features.
    
* **Docker Swarm**: Provides redundancy but lacks Kubernetes' self-healing capabilities.
    

### 4\. **Networking & Load Balancing**

* **Kubernetes**: Offers advanced networking with flexible ingress controllers.
    
* **Docker Swarm**: Uses a simple built-in load balancer.
    

### 5\. **Security**

* **Kubernetes**: Strong security mechanisms (RBAC, network policies, service mesh integration).
    
* **Docker Swarm**: Basic security features, less extensive than Kubernetes.
    

## It’s enough for reading, let’s see an real example

> <mark>TL;DR - The Scenarioi<br>I have a basic go based backend and react based frontend, and they both have some kind of env variables. No i want to deploy those.</mark>

NOTE: You wille be needing some kind of cloud hosted kubernetes platform like EKS(Elastic Kubernetes Service) otherwise you can’t setup kubernetes on your own at this point.

The kubernetes deployment files for botht frontend and backend looks something like this

**Backend - backend.yml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: my-backend:v1
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef:
                name: app-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
```

**Frontend- frontend.yml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: my-frontend:v1
          ports:
            - containerPort: 80
          envFrom:
            - secretRef:
                name: app-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

**Secrets** - app-secrets.yml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DATABASE_URL: <base64-encoded-value>
```

Okay, a whole lot of code which no one understands at this point, ik ik, this is normal. These are the blueprints for the deployments for your apps at this point.

There are some weird things about the secrets that anyone can see. <mark>WHAT THE HACK IS BASE64-ENCODED-VALUE????</mark>

Yes, i was talking about that, secrets in kuberenets work in a different way, you have to first encode the value to base64 value then feed it to k8s script.

Let’s do that too

```yaml
echo "YOUR_SECRET_TEXT" | base64
```

It will give you some weird text like this `aGxraGVhcmtsamRmaXVhbG5lcmxramZkbGhramZqYWtoCg==`

After all of this you are not done yet, you have to apply these changes to the kubernetes cluster.

```bash
kubectl apply -f app-secrets.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml

# To tail the logs of your application
kubectl logs -f deployment/backend

# To scale the backend service
kubectl scale deployment backend --replicas=5

# To update the image to the newer version of the docker image
kubectl rollout restart deployment/backend

# To rollback to previous version of the deployment
kubectl rollout undo deployment/backend
```

Uff that’s was a lot of overhead. One thing keep in mind that, it’s just hte overhead of deploying the application, you never setup the k8s, it’s hell. But we are going to setup the docker swarm to our 3 remote servers

---

```bash
sudo docker swarm init --advertise-addr=127.0.0.1 (if this is real server hosted on cloud then you can do the next one)
sudo docker swarm init
```

It will provide you some token for joining other nodes to you cluster like this

```bash
docker swarm join --token SWMTKN-1-0p7dcz3ltxdgezi6k4eid4t320swjhf170tb0inoo6xjyavmpc-3x6dk6lfv3gmrufvqhfs1q3ky 127.0.0.1:2377
```

In the other nodes you have to paste the upper command, which is given by your machine.

Therefore the story is somewhat same but less cluttered

Docker file - docker-stack.yml

```yaml
version: '3.8'
services:
  backend:
    image: my-backend:v1
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    secrets:
      - db_url
    ports:
      - "8080:8080"

  frontend:
    image: my-frontend:v1
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    secrets:
      - db_url
    ports:
      - "80:80"

secrets:
  db_url:
    external: true
```

Then you have to add the secret

```bash
echo "DATABASE_URL=mydb" | docker secret create db_url -
```

Then let’s deploy our app.

```bash
docker stack deploy -c docker-stack.yml myapp
```

Now comes the part to manage your deployment

```bash
# To scale up and down
docker service scale myapp_backend=5
docker service scale myapp_frontend=5

# To tail the logs
docker service logs -f myapp_backend

# To update to newer version
docker service update --image my-backend:v2 myapp_backend

# To go back to the previous vresion
docker service update --rollback myapp_backend
```

---

## Now that the tutorial part is ended, where do we go now? What should we use??

### When to Use Kubernetes

* Large-scale applications requiring high availability.
    
* Multi-cloud and hybrid cloud deployments.
    
* Microservices-based architectures with complex networking needs.
    

### When to Use Docker Swarm

* Smaller teams or projects requiring quick setup.
    
* Simple deployments where advanced orchestration isn’t needed.
    
* Organizations already using Docker and seeking minimal learning overhead.
    

## Real-World Use Cases & Case Studies

* **Companies using Kubernetes**: Google, Netflix, Spotify.
    
* **Companies using Docker Swarm**: Smaller startups, internal development teams.
    

---

# Conclusion

Kubernetes and Docker Swarm offer different approaches to container orchestration. Kubernetes is powerful for large, complex deployments, while Docker Swarm remains a lightweight and easy-to-use alternative. The right choice depends on the complexity and scale of your project.