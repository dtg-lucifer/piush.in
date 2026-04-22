---
title: "Learn to Deploy Your Application on a Docker Swarm Cluster: Step by step guide (with code)"
seoTitle: "Docker Swarm Deployment Guide: Step-by-Step"
seoDescription: "Deploy applications on a Docker Swarm Cluster with this step-by-step guide. Automate infrastructure and configurations using Terraform and Ansible"
datePublished: Sat Mar 15 2025 10:43:31 GMT+0000 (Coordinated Universal Time)
cuid: cm8a2wm6k000709ky4jm2evru
slug: learn-to-deploy-your-application-on-a-docker-swarm-cluster-step-by-step-guide-with-code
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1741958802860/509de697-418b-4468-ad66-590601d38de6.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1742035391557/b8c4bf74-8ea6-4815-b1d6-12648d4ed36e.png
tags: cloud, docker, ansible, devops, swarm, terraform, gcp, clustering, cluster, docker-stack

---

## **Pre-requisites:**
> There should be some tools installed on your machine before hand to follow along
> 1. [Terraform](https://developer.hashicorp.com/terraform/install?product_intent=terraform) - For provisioning infrastructure on GCP (Google Cloud Platform)
> 2. [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) - For configuration management (Manually update the swarm service from your local machine without needing to ssh into the remote server)
> 3. [Docker](https://docs.docker.com/engine/install/) - For running and conencting to the containers on other machines
> 4. You must have a Linux machine whether it is a VM or your own Machine
> 5. And an free account on GCP (Google Cloud Platform)
> 6. [GCloud CLI Tool](https://cloud.google.com/sdk/docs/install)
>
> ~ Clone the [Github repo](https://github.com/dtg-lucifer/redis-docker-swarm-devops-project) to gain access to the code - Credit goes to [Cloud Champ](https://www.youtube.com/@cloudchamp) for providing the base code for web server
>
> If you don’t know what a cluster is and what is clustering, why do we need that, I highly recommend going through my [this article](https://hashnode.com/post/cm6wjucc3002n08l4cku1h431), it will be good for you to follow along
>
> **TL;DR** - We are not just going to deploy it for once, we are going to deploy it as a senior <mark>devops</mark> engineer who is more focused on <mark>efficiency</mark> and <mark>sustainability</mark> such as after the initial deployment whenever someone makes some changes in the code base our CI server will <mark>automatically redeploy the latest change to the server</mark>

# What we are going to build today ?

1. Basic web server to show the system metrics and store last 5 metrics on Redis cluster as cache (Python, flask)

2. Redis Cluster with 2 nodes (<mark>Leader, follower architecture</mark>)

3. Deploy on a <mark>2 node Docker Swarm Cluster</mark> which is deployed on different <mark>availability zones</mark> for high availibility and Zero Down time (asia-south1-a, asia-south1-b)

4. Will be able to make a CI CD Pipeline to automatically deploy the latest changes to the remote servers

5. Automated infrastructure deployment with <mark>Terraform</mark>

6. Automated configuration Management with <mark>Ansible</mark>


## Build the web server

So, what are we deploying ?

Umm, let’s do a **python based flask backend which will be able to show some metrics about the server health on which that is running on and also store the last 5 logs into a redis cluster (One node will be the leader another will be the follower) as a cache (Well, because in this overhyped age of AI everyone more or less know python, so it’s easy to follow along with)**

Let’s start by initialising the project and add all the necessary folders and files

```bash
mkdir redis-devops
python3 -m venv venv

source ./venv/bin/activate

touch .env
touch .gitignore
mkdir infra # for terraform files
mkdir ansible # for automating the configuration management
mkdir nginx # for proxy config
mkdir templates # for the web app templates
mkdir -p .github/workflows # for CI (Continuous intgration) setup to automate the deployment

# the outline for our project
.
├──  .env.example
├──  .github
│   └──  workflows
│       └──  docker-build.yml
├──  .gitignore
├──  .vscode
│   └──  settings.json
├──  ansible
│   ├──  ansible.cfg
│   ├──  hosts
│   └──  update-deployment.yml
├──  app.py
├──  docker-compose.yml
├──  docker-stack.yml
├──  Dockerfile
├──  infra
│   ├──  .terraform.lock.hcl
│   ├──  keys
│   ├── 󱁢 main.tf
│   ├── 󱁢 outputs.tf
│   ├──  plan
│   │   ├── 󱁉 main.dot
│   │   ├──  main.tfplan
│   │   └──  main_plan.png
│   ├── 󱁢 provider.tf
│   ├──  scripts
│   │   ├──  startup.sh
│   │   └──  startup_with_nginx.sh
│   └── 󱁢 variables.tf
├──  Makefile
├──  nginx
│   └──  nginx.conf
├── 󰂺 README.md
├──  requirements.txt
└──  templates
    └──  index.html
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">❗</div>
<div data-node-type="callout-text"><strong><em><mark>Warning:</mark></em></strong> There are a lot of code written down, so if you want then you can directly clone the github repo from the bottom and follow along with the instructions</div>
</div>

I think we are good to go to build the web server right now

### ***<mark>File - app.py</mark>***

It is the main entrypoint for the web server, it has 3 endpoints rightnow

1. `/` - get the main page

2. `/metrics` - get the metrics in a json formatted way

3. `/health` - for healthcheck


But this is meaningless without the HTML template for the main page

### ***<mark>File - templates/index.html</mark>***

Now it is time to run the server to test whether it is running or not

```bash
python app.py
```

Now the output will look something like this

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1741983208892/24ab4fef-1752-4310-9079-3f5ea9488b1e.png" align="center">

---

Example ***<mark>.env</mark>*** file

```plaintext
# Example environment file - copy to .env and fill in your values
REDIS_PASS=your_secure_password_here
DOCKER_HOST=your_remote_machine_ip
```

Now that we are good here, let’s ignore some credentials from git to monitor, ***<mark>File - .gitignore</mark>***

```plaintext
# ---------------
# Environment
# ---------------
.env
**/vars/**
**credentials.json
/venv/

# ---------------
# Terraform
# ---------------
**.tfvars
**.tfstate**
**.terraform
**.tfplan


# ---------------
# SSH
# ---------------
id_rsa**
```

Now let’s conainerize the app,

### ***<mark>File - Dockerfile</mark>***

This file is the base for our deployment strategy, because we are going to deploy a containerized application so it’s a must to containerize the app

To actually build the image we can run

```bash
# build the image
docker build -t py_system_monitoring_app:latest .

# run the docker image as a conatiner
docker run \
    -p 5001:5001 # port to open \
    -e REDIS_PASS=your_password \
    -e REDIS_HOST=local_redis_host \
    -e REDIS_PORT=6379 # defualt redis port \
    --rm # to remove the container after stopping it \
    -d # to run in detached mode \
    py_system_monitoring_app:latest

# to get the json output from terminal
curl localhost:5001/health
curl localhost:5001/metrics
```

---

### But what if i want to run the whole cluster locally and test it ?

Yes, exactly for this reason there is another file named `docker-compose.yml`, basically it’s almost the same solution we are going to have at the end of this article but there are some differences between ***compose*** and ***stack.***

```bash
docker compose up
docker compose up -d # to run the stack in detached mode
```

Compose is meant for development purpose, where on the other hand docker stack is built for production ready applications.

---

### Now let’s look at the production ready script

Take a look at <mark>File - docker-stack.yml</mark>

*I know it is a lot, but trust me it is the most avg production deployment code. We are almost done at this point with the actual deployment stuff and coding stuff for the app. Now it’s time to change the genre for a little while right.*

Yes, as simple as that, give it some time if you are running this for the first time.

## Quick recap for what we have done so far !

1. First we have created the basic layout for the project

2. Then we have coded the whole web server

3. We created the dockerfile and docker compose for dev with docker stack file for production deployment

4. We ran the compose file to test at the local deployment


## Okay so what’s next ?

Umm, now that we have done this much, there is nothing much for us to do unless we create the **<mark>INFRASTRUCTURE</mark>** for deploy the app on. I.e on <mark>GCP</mark> aka <mark>Google Cloud Platform.</mark> So i have chosen the most widely used <mark>IAC</mark> tool on the market which is used by a lot of tech giants and production firms all over the globe

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">What is IAC - It is a basic term where we define our <mark>infrastructure as code</mark> in a convinient and declarative way and tools like <mark>Terraform</mark>, <mark>Pulumy</mark>, transform that code into actual infrastructure by communicating to the CSP aka <mark>Cloud Service Provider</mark> (such as AWS, GCP, Azure) for us.</div>
</div>

### Let’s configure the folder structure for our terraform code

```bash
 infra
├──  keys
├── 󱁢 main.tf
├── 󱁢 outputs.tf
├──  plan
│   └──  main.tfplan
├── 󱁢 provider.tf
├──  scripts
│   ├──  startup.sh
│   └──  startup_with_nginx.sh
└── 󱁢 variables.tf

### There are some other hidden files which we have to create manuall
### Which i will tell you to do so.
```

For now it will be the structure we have to follow.

Let’s Define our provider at the very first so that we can initialise the terraform project

<mark>File - provider.tf</mark> - This file holds the information about the CSP we are using, in our case it’s Google, because we are going to use google’s free service on google cloud console.

Now we can initialise the project with

```bash
cd infra
terraform init
```

> Don’t worry about the <mark>credentials.json</mark> file right now, i’ll come to it a little bit after, for now just know that it is the main private file you must protect and never share to anyone.

Let’s define our infrastructure, I am not gonna explain much of this, I may explain Terraform on another article after this.

### <mark>File - main.tf</mark>

Now that’s a lot of code

Honestly it is but it has it’s benefits too, otherwise tech giants would be more dumb than me because they use this rather letting their engineers clicking and finding things on the cloud dashboard. Here is an article explaining why IAC is required

1. [https://medium.com/@digitalpower/5-reasons-to-use-infrastructure-as-code-iac-5aef28713751](https://medium.com/@digitalpower/5-reasons-to-use-infrastructure-as-code-iac-5aef28713751)

2. [https://medium.com/@zeero.us/why-infrastructure-as-code-iac-is-the-future-of-software-development-0a935d470d8a](https://medium.com/@zeero.us/why-infrastructure-as-code-iac-is-the-future-of-software-development-0a935d470d8a)


## Breakdown for all of the terraform files

1. `main.tf` - Main entrypoint for out infrastructure code

2. `provider.tf` - Provider details (Google, Amazon, Azure)

3. `variables.tf` - This is the mapping of the secrets and the variables we are going to pass from `*.tfvars` file

4. `output.tf` - This is the file where we put all of our outputs


> ~ Do we really need to write all of these in different files?
> ~ Obviously no, but this is the way for us to focus on little thing.

Now some secret files which we have to create

```bash
### This is like the .env file for us developers
### Secure way to pass sensitive data to our application
touch env.trvars
```

### Now what about the credentials ?

Let’s have a tour from GCP - [https://console.cloud.google.com/](https://console.cloud.google.com/)

1. After creating your billing account and enabling the free trial you should land on this page


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1741985784110/9e954ce3-e050-46af-90c8-eb24dd9c794e.png" alt="">

2. Now go to the sidebar and follow this route, <mark>IAM and admin &gt; Service Accounts</mark>

3. Now click on create service account (For this project)


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1741985934748/8fc295f8-c699-456f-845f-ce03c354341d.png" alt="">

4. Now fill out the details as you like

5. Then click <mark>Create and Continue</mark>


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1741986113957/90cef3dc-7f2a-4308-8abc-dd17c5316369.png" alt="">

6. Now add the following permissions to the Service Account

    1. *Compute Network Admin (This is for VPC)*

    2. *Compute Organisation Firewall Policy Admin (This is for firewall)*

    3. *Service Account Admin (This is to manage and handle service account auth)*

    4. *Compute Admin (To play with VM)*

7. Then create <mark>Continue</mark>

8. Then <mark>Done</mark>

9. Now that you have gone to hom page again, click and open to newly created service account and go to <mark>Keys</mark> tab


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1741986378122/609d4d37-1b12-470f-9e2d-2990550fcf70.png" alt="">

10. Then click on <mark>Add Key</mark>, then choose <mark>Create new key</mark>, then choose <mark>JSON</mark>

11. After that one JSON file would be downloaded for you, keep it safe ***<mark>NEVER SHARE THAT TO ANYONE,</mark>*** and rename it to `credentials.json` and place it into the `infra` folder inside the project


### Now let’s add the secrets to the file <mark>env.tfvars</mark>

```plaintext
project_id       = "project-name-from-gcp-top-left-corner"
region           = "asia-south1" # let it be this if you are in india, else edit it
project_prefix   = "redis-swarm"
machine_type     = "e2-medium"
ssh_user         = "your_ssh_key_user_name"
ssh_pub_key_path = "./keys/id_rsa.pub"
redis_password   = "redis_123"
credentials_file = "./credentials.json"
```

### Now we have to generate a new ssh key

```bash
ssh-keygen -t rsa
# then choose the current working directory to save the key
# don't share that to anyone ever if you don't know what you are doing
```

### At this point you are pretty ready to deploy your first infrastructure with terraform

Let’s do this !!!

```bash
cd infra
terraform plan -var-file=env.tfvars -out=plan/main.tfplan
# it will generate a plan and will also point out if there is any error at all
# if everything is okay then you can apply the plan

terraform apply plan/main.tfplan
# it will take a lot time, almost 5 - 10 minutes
```

Boom !!!

### Now a crucial part to be done

Now we have to copy and store the public ip addresses of both manager node and worker node in out ansible inventory file located at `./ansible/hosts`

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742023302358/e910f015-3a75-48de-8992-0859c3da27bf.png" alt="">

The file should look something like this

```plaintext
[servers]
35.244.43.96        # make sure these are the public ip
34.93.151.141

[managers]
34.93.151.141       # manager public ip

[workers]
35.244.43.96        # worker public ip

[swarm:children]
managers
workers
```

Let’s run the automation

```bash
cd ansible
ansible-playbook -i hosts tasks/install-docker.yaml
```

It will output something like this

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742024154729/993a5521-4d86-4324-b557-5cf305c8edd8.png" alt="">

Now that we have installed docker on both manager and worker node, we have to install nginx as a reverse proxy on the worker node because we don’t want to expose our manager node to be exposed by http and https to the public internet.

```bash
ansible-playbook -i hosts tasks/install-nginx.yaml
```

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742025413142/28e8aae7-fe97-4e65-9297-cffe9092fa64.png" alt="">

Now we have to put our nginx configuration to act as a reverse proxy to be sent over to the remote server

```bash
ansible-playbook -i hosts tasks/setup-proxy.yaml
```

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742025592896/f83a55e7-8c6d-47c4-b9fd-a613f2919c7f.png" alt="">

Wooh !! That was fun, isn’t it ??? Just running few commands and that’s all. If you want to take this to the next level then you also can write a shell script which will run all of these one by one, all you have to do is sit back and relax. (You can also run all of these on a CI server so that whenever you do some changes in the code then the changes appear on the main infrastructure)

Now, the main part, without which the cluster is not a cluster, Let’s install and configure swarm on both servers

```bash
ansible-playbook -i hosts tasks/setup-swarm.yaml
```

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742026676361/6e2cf80c-1f23-450d-abb6-b61b51b8f7b6.png" alt="">

## What we have created so far !

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742020809547/79d58b79-cabf-42df-b8b6-87ee233ceb84.png" alt="">

**<mark>That’s a lot of things we have done so far guys, at-least be proud of yourself for this, ik there is no one appreciating you right now, but i’m here, i do. Let’s celebrate, yayy!!!</mark>**

---

## What’s next ?

Let’s deploy the app for the first time.

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">If you have a better solution I’m all ears because it is something i still need to figure it out. I tried using docker context but i am having some issues with that, so if anyone can solve this please drop me a mail at <a target="_self" rel="noopener noreferrer nofollow" href="mailto:mail@piush.in" style="pointer-events: none"><strong>mail@piush.in</strong></a><strong>, I am open to learn new things</strong></div>
</div>

```bash
export REDIS_PASS=password_for_redis_cache
ansible-playbook -i hosts tasks/create-deployment.yaml
```

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742030356471/d37c6b55-a6d8-499d-a304-d21e8a09ffcf.png" alt="">

Yesssssss……We did it.

## Let’s try this out

1. Go to GCP and then go to <mark>Compute Engine</mark> &gt; <mark>VM Instances</mark>

2. Copy the External IP of the worker node (Remember we did not open the manager node for public use)


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742030566321/ffe8dd09-60bb-4c97-82ea-a78c64100df2.png" alt="">

3. Go to any browser you like and then paste that in there


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742030654033/415119cc-5e91-4515-a6d2-40c8ad0b822d.png" alt="">

## So officially we did it, but what about the next time we do some change to the code repository, let’s say i want to make the deployment from v3 to v4 ?

That’s the reason we need CI CD Pipelines in our code bases and on our source controls like Git, Gitlab, Bitbucket

There are multiple options to pick from

* Github Actions (Easy to start working with)

* Gitlab CI

* Travis CI

* Jenkins (By far the most used Open source ci server in terms of production)

* Circle CI

* ……etc


For this project I chose to work with Github Actions because it is easy to use and also we have done a lot of work with the infrastructure previously so i don’t wanna create and setup another server for our CI tool.

Let’s do this !!!

You will find a folder named `.github/workflows` at the root of our project, there is a YAML file named `docker-build.yml`. This is the file you push this repo to your github account then you can find a button called Actions on your dashboard like below

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742031648553/89a57855-3593-40fb-b5b2-f4c96100920f.png" alt="">

So all the file does it whenever someone pushes change to the ***master*** branch or opens a pull request on the ***master*** branch it will simply build the docker image out of the `Dockerfile` at our root of the project and pushes that to the docker hub account of yours (Which we have to setup) and then update the deployment at our remote manager node on the docker swarm to use the lates image. And swarm will start a rolling update based on the configuration

```yaml
....
....
deploy:
      replicas: 10 # total number of replicas
      ....
      ....
      update_config:
        parallelism: 2 # it means it will update 2 containers at the same time
        delay: 10s # it will wait for 10 seconds before going to the next 2 containers
        order: start-first # it will start the containers first then remove the older ones so that there will be no down time
        failure_action: rollback # if any one of the containers fail then it will rollback them to the older image as a fail safe machanism until there is more directions from the manager node
....
....
```

### Now we have to setup our credentials to Github so that it can do the work on our behalf

1. Create docker hub token

    1. Go to - [https://hub.docker.com/](https://hub.docker.com/) and Signin to your account

    2. Go to account settings and then go to personal access tokens


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032145314/4c085570-d6be-44fc-b04f-d3affb3610bc.png" alt="">

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032150773/ed210785-57a6-4ba2-8a65-dd66aa19402a.png" alt="">

3. Store the token somewhere safe and don’t share to anyone (Make sure that has Read and write permission to it)

4. Copy the token over to github


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032266130/3cb2ed64-f855-4e28-af8d-72e6d0e6960f.png" alt="">

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032273895/68bd3704-beb5-4934-b93f-fa3618910a3c.png" alt="">

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032278339/dde33cff-4405-465b-af08-787e0f202f85.png" alt="">

4. Fill out these necessary things

    1. DOCKER\_HUB\_TOKEN - Already got it

    2. MANAGER\_IP - also got it

    3. SSH\_PRIVATE\_KEY - run this command at the root of the project `cat infra/keys/id_rsa` and then copy and paste the content over there

5. Also add your docker hub user name there.


<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032450315/6fa20ed7-2adf-4776-a635-ce6ba5cc4471.png" alt="">

---

## Now we are good to go.

Test that by making some change to the code, the actions tab should look something like this (Ignore the commit messages, fraustration on another level)

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032524473/5a94892b-985c-44d4-a138-469e76380dd0.png" alt="">

## So with this we have officially built the whole DevOps Projec in just under an hour

And the final outcome looks something like this

<img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1742032789490/5b9ca928-eef4-4666-82fa-98713bfc4258.png" alt="">

# Stay tuned for next articles on different types of deployment models and DevOps projects.

~ @[Piush Bose](@devpiush) &lt;mail@piush.in&gt;, Signing off

---

## Deployment series (Upcoming articles and knowledge)

#### **<mark>Serverless Series</mark>**

* deployment - sl1a, Deploy on cloud run (Pending)

* deployment - sl1b, Deploy on app engine (Pending)

* deployment - sl1c, Deploy on Google Cloud Functions (FaaS) (Pending)


### <mark>Server wide</mark>

* <mark>Containerised</mark>

    * <s>deployment - ws1a (Already done on gdg first session)</s>

    * <s>deployment - ws1b, Containerized and then deployed on Docker Swarm cluster with multiple nodes (This article itself)</s>

    * deployment - ws1c, Containerized and deployed on kubernetes cluster (Pending)

* <mark>Bare metal</mark>

    * deployment - ws2a, Deployed directly on a vm and served with nginx (Easiest one) (Pending)

    * deployment - ws2b, Deployed on multiple vm and added them to a auto scaling group and load balance between them (Pending)

    * deployment - ws2c, Shipt the frontend code to Cloud Store bucket and distribute it with Cloud CDN and deploy the backend on any of the solution from before.
