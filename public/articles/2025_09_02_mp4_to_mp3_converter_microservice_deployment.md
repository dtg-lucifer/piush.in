---
title: "🚀 Building a Production-Ready Video-to-Audio Converter with Python Microservices and Kubernetes"
seoTitle: "Video-to-Audio Converter with Python Microservices"
seoDescription: "Build a scalable video-to-audio converter with Python microservices and Kubernetes, focusing on architecture, deployment, and security"
datePublished: Tue Sep 02 2025 14:34:37 GMT+0000 (Coordinated Universal Time)
cuid: cmf2nggvm000202l7hfiehstt
slug: building-a-production-ready-video-to-audio-converter-with-python-microservices-and-kubernetes
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1756823474617/9e98aa38-a034-4c42-ab98-72195e4ac006.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1756823503313/cd960ffe-6502-4fbc-a62d-5bf3591e2a63.png
tags: python, mongodb, kubernetes, rabbitmq, ffmpeg, minikube, grid-fs

---

## Introduction

In today's cloud-native world, building scalable and maintainable applications requires a deep understanding of microservices architecture, containerization, and orchestration. This comprehensive guide will walk you through building a production-ready video-to-audio converter using Python microservices, deployed and managed with Kubernetes.

### What You'll Learn

* How to design and implement a microservices architecture
    
* Asynchronous processing with message queues
    
* Kubernetes deployment and orchestration
    
* Database management in a distributed system
    
* Security best practices for microservices
    
* Production deployment strategies
    

### Prerequisites

* Basic understanding of Python and Flask
    
* Familiarity with Docker and containerization
    
* Basic knowledge of Kubernetes concepts
    
* Understanding of databases (MySQL, MongoDB)
    
* Command line proficiency
    

---

## System Architecture Overview

Our video-to-audio converter consists of four main microservices that work together to provide a complete solution:

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                    Client Application                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Gateway Service                              │
│                    (Port 8000)                                 │
│                                                                 │
│  • File Upload/Download                                         │
│  • Request Routing                                              │
│  • Authentication Validation                                    │
└─────────────┬─────────────────────────────┬─────────────────────┘
              │                             │
              │ JWT Validation              │ Message Publishing
              │                             │
┌─────────────▼─────────────────┐          ┌▼─────────────────────┐
│        Auth Service           │          │      RabbitMQ        │
│        (Port 5000)            │          │   Message Broker     │
│                               │          │                      │
│  • User Authentication        │          │  • video queue       │
│  • JWT Token Generation       │          │  • mp3 queue         │
│  • User Management            │          │  • Dead letter queue │
└───────────────────────────────┘          └┬─────────────────────┘
                                             │
                                             │ Message Consumption
                                             │
                          ┌──────────────────▼──────────────────┐
                          │           Converter Service         │
                          │                                     │
                          │  • Video Processing                 │
                          │  • FFmpeg Integration              │
                          │  • File Format Conversion          │
                          └──────────────┬──────────────────────┘
                                         │
                                         │ Completion Notification
                                         │
                          ┌──────────────▼──────────────────────┐
                          │        Notification Service        │
                          │                                     │
                          │  • Email Notifications             │
                          │  • Status Updates                  │
                          │  • User Communication              │
                          └─────────────────────────────────────┘
```

### Data Flow Architecture

```plaintext
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  MySQL  │    │ MongoDB │    │ MongoDB │    │  Email  │
│   DB    │    │ Videos  │    │   MP3   │    │  SMTP   │
│         │    │  (GridFS)│    │ (GridFS)│    │ Server  │
└────▲────┘    └────▲────┘    └────▲────┘    └────▲────┘
     │              │              │              │
     │              │              │              │
┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
│  Auth   │    │Gateway  │    │Converter│    │Notification│
│Service  │    │Service  │    │Service  │    │Service  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Key Design Principles

1. **Single Responsibility**: Each service has one specific purpose
    
2. **Loose Coupling**: Services communicate through well-defined APIs
    
3. **High Cohesion**: Related functionality is grouped together
    
4. **Fault Tolerance**: Services can handle failures gracefully
    
5. **Scalability**: Individual services can be scaled independently
    

---

## Understanding Microservices Architecture

### What Are Microservices?

Microservices architecture is a method of developing software applications as a suite of independently deployable, small, modular services. Each service runs in its own process and communicates via well-defined, lightweight mechanisms.

### Benefits of Our Microservices Approach

1. **Independent Deployment**: Update services without affecting others
    
2. **Technology Diversity**: Each service can use different technologies
    
3. **Fault Isolation**: Failure in one service doesn't bring down the entire system
    
4. **Team Autonomy**: Different teams can own different services
    
5. **Scalability**: Scale services based on demand
    

### Communication Patterns

Our system uses two main communication patterns:

#### 1\. Synchronous Communication (HTTP/REST)

* Client to Gateway Service
    
* Gateway to Auth Service
    
* Used for immediate responses
    

#### 2\. Asynchronous Communication (Message Queues)

* Gateway to Converter Service (via RabbitMQ)
    
* Converter to Notification Service (via RabbitMQ)
    
* Used for long-running operations
    

---

## Deep Dive into Each Service

### 1\. Gateway Service

The Gateway Service acts as the entry point for all client requests, implementing the API Gateway pattern.

#### Core Responsibilities

```python
# Key functionality areas
├── Authentication Validation
├── File Upload Management
├── Request Routing
├── Response Aggregation
└── Error Handling
```

#### Key Components

**File Upload Handler**

```python
@app.route('/upload', methods=['POST'])
def upload():
    # Validate JWT token
    token, err = validate.token(request)

    # Check admin privileges
    if access_data["is_admin"]:
        # Process file upload
        # Store in MongoDB GridFS
        # Publish message to RabbitMQ
        return "File uploaded successfully", 200
```

**MongoDB GridFS Integration**

* Stores large video files efficiently
    
* Handles file chunking automatically
    
* Provides metadata storage
    

**RabbitMQ Publishing**

* Publishes video processing jobs
    
* Ensures message durability
    
* Handles connection failures gracefully
    

#### Technology Stack

* **Framework**: Flask (Python web framework)
    
* **Database**: MongoDB with GridFS for file storage
    
* **Message Queue**: RabbitMQ for asynchronous processing
    
* **Authentication**: JWT token validation
    

### 2\. Authentication Service

The Auth Service manages user authentication and authorization using JWT tokens.

#### Core Responsibilities

```python
# Authentication workflow
├── User Login Validation
├── JWT Token Generation
├── Token Validation
├── User Session Management
└── Admin Permission Control
```

#### JWT Implementation

**Token Generation**

```python
def create_token(username: str, secret: str, is_admin: bool) -> str:
    return jwt.encode({
        'user_email': username,
        'is_admin': is_admin,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
        'iat': datetime.datetime.now(datetime.timezone.utc)
    }, secret, algorithm='HS256')
```

**Token Validation**

```python
def validate_jwt(token: str, secret: str) -> dict | None:
    try:
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
```

#### Database Schema

```sql
-- Users table structure
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Technology Stack

* **Framework**: Flask with Flask-MySQL
    
* **Database**: MySQL for user data
    
* **Authentication**: JWT for stateless authentication
    
* **Security**: bcrypt for password hashing (recommended)
    

### 3\. Converter Service

The Converter Service handles the core business logic of converting video files to MP3 audio.

#### Core Responsibilities

```python
# Conversion workflow
├── Message Queue Consumption
├── Video File Retrieval
├── Audio Extraction
├── Format Conversion
└── Result Storage
```

#### Processing Pipeline

```plaintext
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Receive   │    │   Download  │    │   Convert   │
│   Message   │───▶│    Video    │───▶│  to Audio   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
┌─────────────┐    ┌─────────────┐           │
│   Publish   │    │    Store    │◀──────────┘
│Notification │◀───│    MP3      │
│             │    │             │
└─────────────┘    └─────────────┘
```

#### Message Processing

**Consumer Implementation**

```python
def callback(ch, method, _properties, body):
    err = to_mp3.start(body, fs_videos, fs_mp3, ch)
    if err:
        ch.basic_nack(delivery_tag=method.delivery_tag)
    else:
        ch.basic_ack(delivery_tag=method.delivery_tag)
```

#### Video Conversion Process

1. **Message Reception**: Receives job from RabbitMQ
    
2. **File Retrieval**: Downloads video from MongoDB GridFS
    
3. **Audio Extraction**: Uses FFmpeg/MoviePy for conversion
    
4. **Quality Control**: Validates output file
    
5. **Storage**: Saves MP3 to MongoDB GridFS
    
6. **Notification**: Publishes completion message
    

#### Technology Stack

* **Framework**: Pure Python with Pika for RabbitMQ
    
* **Processing**: FFmpeg and MoviePy for video conversion
    
* **Database**: MongoDB GridFS for file storage
    
* **Message Queue**: RabbitMQ for job processing
    

### 4\. Notification Service

The Notification Service handles user communication and status updates.

#### Core Responsibilities

```python
# Notification workflow
├── Message Queue Monitoring
├── Email Template Processing
├── SMTP Communication
├── Delivery Status Tracking
└── Error Handling and Retry Logic
```

#### Email Notification System

**Message Processing with Retry Logic**

```python
def callback(ch, method, properties, body):
    try:
        message_data = json.loads(body)

        # Validate message structure
        if 'mp3_fid' not in message_data:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        # Send notification
        err = email.notify(body)
        if err:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        else:
            ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
```

#### Notification Types

1. **Conversion Started**: Job received and processing began
    
2. **Conversion Complete**: File ready for download
    
3. **Conversion Failed**: Error occurred during processing
    
4. **System Alerts**: Service health notifications
    

#### Technology Stack

* **Framework**: Pure Python with Pika
    
* **Email**: SMTP with Gmail integration
    
* **Message Queue**: RabbitMQ for notification jobs
    
* **Templating**: HTML email templates
    

---

## Message Queue Communication with RabbitMQ

### Why RabbitMQ?

RabbitMQ provides reliable, scalable message queuing that enables asynchronous communication between our services.

### Queue Architecture

```plaintext
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Gateway   │    │  RabbitMQ   │    │  Converter  │
│   Service   │───▶│    Broker   │───▶│   Service   │
│             │    │             │    │             │
└─────────────┘    │  ┌───────┐  │    └─────────────┘
                   │  │ video │  │
                   │  │ queue │  │
                   │  └───────┘  │
                   │             │    ┌─────────────┐
                   │  ┌───────┐  │    │Notification │
                   │  │  mp3  │  │───▶│   Service   │
                   │  │ queue │  │    │             │
                   │  └───────┘  │    └─────────────┘
                   └─────────────┘
```

### Message Flow Patterns

#### 1\. Video Processing Queue

**Publisher (Gateway Service)**

```python
# Publishing video processing job
message = {
    "video_fid": str(video_fid),
    "mp3_fid": str(mp3_fid),
    "username": access_data["user_email"]
}

channel.basic_publish(
    exchange="",
    routing_key="video",
    body=json.dumps(message),
    properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
)
```

**Consumer (Converter Service)**

```python
# Consuming video processing jobs
channel.basic_consume(
    queue="video",
    on_message_callback=callback,
)
```

#### 2\. Notification Queue

**Publisher (Converter Service)**

```python
# Publishing notification job
notification = {
    "mp3_fid": mp3_fid,
    "user_email": username,
    "status": "completed"
}

channel.basic_publish(
    exchange="",
    routing_key="mp3",
    body=json.dumps(notification)
)
```

### Message Durability and Reliability

#### Queue Declaration

```python
# Ensure queue persistence
channel.queue_declare(queue='video', durable=True)
channel.queue_declare(queue='mp3', durable=True)
```

#### Message Acknowledgment

```python
# Manual acknowledgment for reliability
channel.basic_qos(prefetch_count=1)
channel.basic_consume(
    queue='video',
    on_message_callback=callback,
    auto_ack=False  # Manual acknowledgment
)
```

### Error Handling and Dead Letter Queues

```python
# Dead letter queue configuration
channel.queue_declare(
    queue='video_dlq',
    durable=True,
    arguments={
        'x-message-ttl': 300000,  # 5 minutes
        'x-dead-letter-exchange': 'dlx'
    }
)
```

---

## Kubernetes Orchestration

### Why Kubernetes?

Kubernetes provides container orchestration, enabling:

* Automated deployment and scaling
    
* Service discovery and load balancing
    
* Self-healing capabilities
    
* Rolling updates with zero downtime
    

### Deployment Architecture

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                          │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │   Gateway     │  │     Auth      │  │   Converter   │      │
│  │   Deployment  │  │   Deployment  │  │   Deployment  │      │
│  │   (2 replicas)│  │   (2 replicas)│  │   (1 replica) │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐                          │
│  │ Notification  │  │   RabbitMQ    │                          │
│  │  Deployment   │  │  StatefulSet  │                          │
│  │  (1 replica)  │  │  (1 replica)  │                          │
│  └───────────────┘  └───────────────┘                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Services                              │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │   │
│  │  │Gateway  │ │  Auth   │ │RabbitMQ │ │ Internal│      │   │
│  │  │Service  │ │Service  │ │Service  │ │Services │      │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Kubernetes Resources

#### 1\. Deployments

**Gateway Service Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: gateway
    labels:
        app: gateway
spec:
    replicas: 2
    selector:
        matchLabels:
            app: gateway
    strategy:
        type: RollingUpdate
        rollingUpdate:
            maxUnavailable: 1
            maxSurge: 3
    template:
        metadata:
            labels:
                app: gateway
        spec:
            containers:
                - name: gateway
                  image: devpiush/python-microservice-gateway:latest
                  envFrom:
                      - configMapRef:
                            name: gateway-config
                      - secretRef:
                            name: gateway-secrets
                  resources:
                      requests:
                          memory: "256Mi"
                          cpu: "250m"
                      limits:
                          memory: "512Mi"
                          cpu: "500m"
```

#### 2\. Services

**Service Discovery and Load Balancing**

```yaml
apiVersion: v1
kind: Service
metadata:
    name: gateway
spec:
    selector:
        app: gateway
    ports:
        - port: 8000
          targetPort: 8000
    type: ClusterIP
```

#### 3\. ConfigMaps and Secrets

**Configuration Management**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: gateway-config
data:
    RABBITMQ_HOST: rabbitmq
    AUTH_SVC_ADDR: auth:5000

---
apiVersion: v1
kind: Secret
metadata:
    name: gateway-secrets
type: Opaque
data:
    MONGO_URI: <base64-encoded-uri>
    MONGO_MP3_URI: <base64-encoded-uri>
```

#### 4\. StatefulSets for RabbitMQ

**Persistent Message Broker**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
    name: rabbitmq
spec:
    serviceName: rabbitmq
    replicas: 1
    selector:
        matchLabels:
            app: rabbitmq
    template:
        spec:
            containers:
                - name: rabbitmq
                  image: rabbitmq:3.9-management
                  volumeMounts:
                      - name: rabbitmq-data
                        mountPath: /var/lib/rabbitmq
    volumeClaimTemplates:
        - metadata:
              name: rabbitmq-data
          spec:
              accessModes: ["ReadWriteOnce"]
              resources:
                  requests:
                      storage: 1Gi
```

### Scaling Strategies

#### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
    name: gateway-hpa
spec:
    scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: gateway
    minReplicas: 2
    maxReplicas: 10
    metrics:
        - type: Resource
          resource:
              name: cpu
              target:
                  type: Utilization
                  averageUtilization: 70
```

---

## Database Design and Management

### Database Architecture Overview

```plaintext
┌─────────────────┐    ┌─────────────────┐
│     MySQL       │    │    MongoDB      │
│   (Auth Data)   │    │  (File Storage) │
│                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │
│  │   users   │  │    │  │ gateway_db│  │
│  │   table   │  │    │  │ (videos)  │  │
│  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │
│                 │    │  ┌───────────┐  │
│                 │    │  │   mp3_db  │  │
│                 │    │  │  (audio)  │  │
│                 │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘
```

### 1\. MySQL for Authentication

#### Why MySQL for Auth?

* ACID compliance for user data
    
* Strong consistency for authentication
    
* Mature ecosystem and tooling
    
* Excellent performance for read-heavy workloads
    

#### Schema Design

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Sessions table (optional for enhanced security)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);
```

### 2\. MongoDB for File Storage

#### Why MongoDB GridFS?

* Handles large files (&gt;16MB)
    
* Automatic file chunking
    
* Metadata storage capabilities
    
* Horizontal scaling support
    

#### GridFS Structure

```javascript
// GridFS automatically creates two collections:

// fs.files - File metadata
{
  "_id": ObjectId("..."),
  "filename": "video.mp4",
  "length": 52428800,
  "chunkSize": 261120,
  "uploadDate": ISODate("..."),
  "metadata": {
    "user_email": "user@example.com",
    "original_name": "my_video.mp4",
    "content_type": "video/mp4"
  }
}

// fs.chunks - File data chunks
{
  "_id": ObjectId("..."),
  "files_id": ObjectId("..."),
  "n": 0,
  "data": BinData(...)
}
```

#### Database Connection Management

**Connection Pooling and Retry Logic**

```python
# MongoDB connection with retry logic
def connect_to_mongodb(uri, max_retries=3):
    for attempt in range(max_retries):
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Test connection
            client.admin.command('ping')
            return client
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

### 3\. Data Consistency and Backup

#### Backup Strategies

```bash
# MongoDB backup
mongodump --host host.minikube.internal:27017 \
         --username piush \
         --password password \
         --out /backup/mongodb/

# MySQL backup
mysqldump --host host.minikube.internal \
         --user piush \
         --password=password \
         auth_db > /backup/mysql/auth_db.sql
```

#### Data Migration Scripts

```python
# Example migration script
def migrate_user_data():
    """Migrate user data with validation"""

    # Connect to databases
    mysql_conn = mysql.connection
    mongo_client = MongoClient(MONGO_URI)

    # Migration logic
    cursor = mysql_conn.cursor()
    cursor.execute("SELECT * FROM users")

    for user in cursor.fetchall():
        # Validate and transform data
        migrated_user = transform_user_data(user)

        # Insert into new system
        mongo_client.users.insert_one(migrated_user)
```

---

## Security Implementation

### Multi-Layer Security Architecture

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                        Security Layers                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Network Security                         │   │
│  │  • TLS/HTTPS Encryption                                 │   │
│  │  • Network Policies                                     │   │
│  │  • Firewall Rules                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Application Security                       │   │
│  │  • JWT Authentication                                   │   │
│  │  • Input Validation                                     │   │
│  │  • Rate Limiting                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Data Security                             │   │
│  │  • Password Hashing                                     │   │
│  │  • Database Encryption                                  │   │
│  │  • Secrets Management                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1\. Authentication and Authorization

#### JWT Token Implementation

**Token Structure**

```json
{
    "header": {
        "typ": "JWT",
        "alg": "HS256"
    },
    "payload": {
        "user_email": "user@example.com",
        "is_admin": true,
        "exp": 1640995200,
        "iat": 1640908800
    },
    "signature": "encrypted_signature"
}
```

**Enhanced Token Validation**

```python
def validate_token_with_refresh(token, secret):
    """Enhanced token validation with refresh logic"""
    try:
        decoded = jwt.decode(token, secret, algorithms=['HS256'])

        # Check if token expires soon (within 1 hour)
        exp_time = datetime.fromtimestamp(decoded['exp'])
        if exp_time - datetime.now() < timedelta(hours=1):
            # Issue refresh token
            return decoded, create_refresh_token(decoded)

        return decoded, None

    except jwt.ExpiredSignatureError:
        # Check if refresh is possible
        return None, "token_expired"
    except jwt.InvalidTokenError:
        return None, "invalid_token"
```

#### Role-Based Access Control (RBAC)

```python
def check_permissions(user_data, required_permission):
    """Check user permissions for specific actions"""
    user_roles = user_data.get('roles', [])
    user_permissions = get_permissions_for_roles(user_roles)

    return required_permission in user_permissions

# Decorator for permission checking
def require_permission(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token, err = validate.token(request)
            if err:
                return str(err[0]), err[1]

            user_data = json.loads(token)
            if not check_permissions(user_data, permission):
                return "Insufficient permissions", 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Usage
@app.route('/admin/users', methods=['GET'])
@require_permission('admin.users.read')
def list_users():
    # Admin-only endpoint
    pass
```

### 2\. Input Validation and Sanitization

```python
from marshmallow import Schema, fields, validate

class FileUploadSchema(Schema):
    """Validate file upload requests"""
    file = fields.Raw(required=True)
    filename = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255)
    )
    content_type = fields.Str(
        required=True,
        validate=validate.OneOf([
            'video/mp4', 'video/avi', 'video/quicktime',
            'video/x-msvideo', 'video/x-ms-wmv'
        ])
    )

def validate_upload(request):
    """Validate file upload with comprehensive checks"""
    schema = FileUploadSchema()

    try:
        # Basic validation
        data = schema.load(request.form)

        # File size validation
        file = request.files.get('file')
        if file.content_length > MAX_FILE_SIZE:
            return None, "File too large"

        # File type validation
        if not is_valid_video_file(file):
            return None, "Invalid file type"

        # Virus scanning (in production)
        if not scan_for_malware(file):
            return None, "File failed security scan"

        return data, None

    except ValidationError as e:
        return None, str(e)
```

### 3\. Secrets Management

#### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
    name: app-secrets
type: Opaque
data:
    mysql-password: <base64-encoded-password>
    mongodb-uri: <base64-encoded-uri>
    jwt-secret: <base64-encoded-secret>
    smtp-password: <base64-encoded-password>
```

#### Environment-based Configuration

```python
import os
from cryptography.fernet import Fernet

class Config:
    """Centralized configuration management"""

    # Database configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = decrypt_if_encrypted(os.getenv('MYSQL_PASSWORD'))

    # JWT configuration
    JWT_SECRET = os.getenv('JWT_SECRET')
    JWT_EXPIRY = int(os.getenv('JWT_EXPIRY', '86400'))  # 24 hours

    # File upload limits
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', '104857600'))  # 100MB

    @staticmethod
    def decrypt_if_encrypted(value):
        """Decrypt value if it's encrypted"""
        if value and value.startswith('encrypted:'):
            cipher = Fernet(os.getenv('ENCRYPTION_KEY'))
            return cipher.decrypt(value[10:]).decode()
        return value
```

### 4\. Network Security

#### Kubernetes Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: gateway-network-policy
spec:
    podSelector:
        matchLabels:
            app: gateway
    policyTypes:
        - Ingress
        - Egress
    ingress:
        - from:
              - podSelector:
                    matchLabels:
                        app: nginx-ingress
          ports:
              - protocol: TCP
                port: 8000
    egress:
        - to:
              - podSelector:
                    matchLabels:
                        app: auth
          ports:
              - protocol: TCP
                port: 5000
        - to:
              - podSelector:
                    matchLabels:
                        app: rabbitmq
          ports:
              - protocol: TCP
                port: 5672
```

---

## Setting Up Your Development Environment

### Prerequisites Installation

#### 1\. Install Required Tools

**macOS (using Homebrew)**

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install docker
brew install kubectl
brew install minikube
brew install python@3.11
brew install git
```

**Ubuntu/Debian**

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-pip
```

#### 2\. Verify Installation

```bash
# Verify Docker
docker --version
docker run hello-world

# Verify Kubernetes
kubectl version --client

# Verify Minikube
minikube version

# Verify Python
python3.11 --version
pip3 --version
```

### Local Development Setup

#### 1\. Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd python-video-to-audio-microservices

# Create virtual environment for each service
cd auth_service
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

cd gateway
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

# Repeat for other services
```

#### 2\. Setup External Databases

**Start Database Services**

```bash
# Start databases using Docker Compose
docker-compose up -d

# Verify databases are running
docker ps

# Test MySQL connection
mysql -h localhost -u piush -p auth_db

# Test MongoDB connection
mongosh "mongodb://piush:password@localhost:27017/gateway_db?authSource=admin"
```

#### 3\. Environment Configuration

**Create .env files for each service**

**.env for auth\_service**

```bash
MYSQL_HOST=localhost
MYSQL_USER=piush
MYSQL_PASSWORD=password
MYSQL_DB=auth_db
JWT_SECRET=your_development_secret_key_here
```

**.env for gateway**

```bash
MONGO_URI=mongodb://piush:password@localhost:27017/gateway_db?authSource=admin
MONGO_MP3_URI=mongodb://piush:password@localhost:27017/mp3?authSource=admin
AUTH_SVC_ADDR=localhost:5000
RABBITMQ_HOST=localhost
```

#### 4\. Development Workflow

**Terminal Setup for Development**

```bash
# Terminal 1: Start RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3.9-management

# Terminal 2: Start Auth Service
cd auth_service
source .venv/bin/activate
python server.py

# Terminal 3: Start Gateway Service
cd gateway
source .venv/bin/activate
python server.py

# Terminal 4: Start Converter Service
cd converter
source .venv/bin/activate
python consumer.py

# Terminal 5: Start Notification Service
cd notification
source .venv/bin/activate
python consumer.py
```

### Development Tools and Best Practices

#### 1\. Code Quality Tools

**Setup Pre-commit Hooks**

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8

  - repo: https://github.com/pycqa/isort
    rev: 5.10.1
    hooks:
      - id: isort
EOF

# Install hooks
pre-commit install
```

#### 2\. Testing Setup

**Unit Testing Framework**

```python
# tests/test_auth_service.py
import unittest
import json
from auth_service.server import app

class TestAuthService(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        app.config['TESTING'] = True

    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'OK')

    def test_login_without_auth(self):
        """Test login without authorization headers"""
        response = self.app.post('/login')
        self.assertEqual(response.status_code, 401)

    def test_login_with_valid_credentials(self):
        """Test login with valid credentials"""
        # Setup test user in database
        # ... test implementation
        pass

if __name__ == '__main__':
    unittest.main()
```

**Integration Testing**

```python
# tests/test_integration.py
import requests
import time
import unittest

class TestIntegration(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:8000"
        self.auth_url = "http://localhost:5000"

    def test_complete_workflow(self):
        """Test complete video conversion workflow"""

        # 1. Login and get token
        auth_response = requests.post(
            f"{self.auth_url}/login",
            auth=('admin@example.com', 'password')
        )
        self.assertEqual(auth_response.status_code, 200)
        token = auth_response.text

        # 2. Upload video file
        with open('test_video.mp4', 'rb') as f:
            upload_response = requests.post(
                f"{self.base_url}/upload",
                files={'file': f},
                headers={'Authorization': f'Bearer {token}'}
            )
        self.assertEqual(upload_response.status_code, 200)

        # 3. Wait for processing (in real test, use polling)
        time.sleep(30)

        # 4. Download converted file
        # ... implementation
```

#### 3\. Monitoring and Debugging

**Logging Configuration**

```python
# utils/logging_config.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging(service_name, log_level="INFO"):
    """Setup structured logging for microservices"""

    # Create logger
    logger = logging.getLogger(service_name)
    logger.setLevel(getattr(logging, log_level))

    # Create handler
    handler = logging.StreamHandler(sys.stdout)

    # Create formatter
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(handler)

    return logger

# Usage in services
logger = setup_logging("gateway_service")
logger.info("Service started", extra={"port": 8000})
```

---

## Deployment Guide

### Production Deployment Strategy

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                    Deployment Pipeline                         │
│                                                                 │
│  ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐             │
│  │  Dev  │───▶│ Test  │───▶│Staging│───▶│ Prod  │             │
│  │       │    │       │    │       │    │       │             │
│  └───────┘    └───────┘    └───────┘    └───────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CI/CD Pipeline                             │   │
│  │                                                         │   │
│  │  Code → Build → Test → Security Scan → Deploy         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Deployment Process

#### 1\. Prepare Kubernetes Cluster

**Start Minikube with Adequate Resources**

```bash
# Delete existing cluster if any
minikube delete

# Start with sufficient resources
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=20g \
  --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard

# Verify cluster status
kubectl cluster-info
kubectl get nodes
```

#### 2\. Setup External Dependencies

**Database Setup with Docker Compose**

```bash
# Start external databases
docker-compose up -d

# Verify database connectivity
docker exec -it mysql_db mysql -u piush -p auth_db
docker exec -it mongodb mongosh "mongodb://piush:password@localhost:27017/gateway_db?authSource=admin"

# Initialize MySQL schema
mysql -h localhost -u piush -p auth_db < auth_service/init.sql
```

#### 3\. Build and Push Docker Images

**Build Images Locally**

```bash
# Build auth service
cd auth_service
docker build -t devpiush/python-microservice-auth:latest .

# Build gateway service
cd ../gateway
docker build -t devpiush/python-microservice-gateway:latest .

# Build converter service
cd ../converter
docker build -t devpiush/python-microservice-converter:latest .

# Build notification service
cd ../notification
docker build -t devpiush/python-microservice-notification:latest .
```

**Push to Registry (Optional)**

```bash
# Login to Docker Hub
docker login

# Push images
docker push devpiush/python-microservice-auth:latest
docker push devpiush/python-microservice-gateway:latest
docker push devpiush/python-microservice-converter:latest
docker push devpiush/python-microservice-notification:latest
```

**Load Images into Minikube**

```bash
# Load images directly into Minikube
minikube image load devpiush/python-microservice-auth:latest
minikube image load devpiush/python-microservice-gateway:latest
minikube image load devpiush/python-microservice-converter:latest
minikube image load devpiush/python-microservice-notification:latest

# Verify images are loaded
minikube image ls | grep devpiush
```

#### 4\. Deploy Services in Order

**Step 4.1: Deploy RabbitMQ**

```bash
# Deploy RabbitMQ StatefulSet
kubectl apply -f gateway/rabbitmq/manifests/

# Wait for RabbitMQ to be ready
kubectl wait --for=condition=ready pod -l app=rabbitmq --timeout=300s

# Verify RabbitMQ is running
kubectl get pods -l app=rabbitmq
kubectl logs -l app=rabbitmq
```

**Step 4.2: Deploy Auth Service**

```bash
# Deploy auth service
kubectl apply -f auth_service/manifests/

# Wait for deployment
kubectl wait --for=condition=available deployment/auth --timeout=300s

# Verify deployment
kubectl get pods -l app=auth
kubectl logs -l app=auth
```

**Step 4.3: Deploy Gateway Service**

```bash
# Deploy gateway service
kubectl apply -f gateway/manifests/

# Wait for deployment
kubectl wait --for=condition=available deployment/gateway --timeout=300s

# Verify deployment
kubectl get pods -l app=gateway
kubectl logs -l app=gateway
```

**Step 4.4: Deploy Converter Service**

```bash
# Deploy converter service
kubectl apply -f converter/manifests/

# Wait for deployment
kubectl wait --for=condition=available deployment/converter --timeout=300s

# Verify deployment
kubectl get pods -l app=converter
```

**Step 4.5: Deploy Notification Service**

```bash
# Deploy notification service
kubectl apply -f notification/manifests/

# Wait for deployment
kubectl wait --for=condition=available deployment/notification --timeout=300s

# Verify deployment
kubectl get pods -l app=notification
```

#### 5\. Verify Complete Deployment

**Check All Services**

```bash
# Get all pods
kubectl get pods

# Expected output:
# NAME                           READY   STATUS    RESTARTS   AGE
# auth-xxx-xxx                   1/1     Running   0          5m
# gateway-xxx-xxx                1/1     Running   0          4m
# gateway-xxx-yyy                1/1     Running   0          4m
# converter-xxx-xxx              1/1     Running   0          3m
# notification-xxx-xxx           1/1     Running   0          2m
# rabbitmq-0                     1/1     Running   0          6m

# Check services
kubectl get services

# Check deployments
kubectl get deployments
```

**Health Checks**

```bash
# Port forward for testing
kubectl port-forward service/gateway 8000:8000 &
kubectl port-forward service/auth 5000:5000 &

# Test auth service health
curl http://localhost:5000/health

# Test gateway service health
curl http://localhost:8000/health

# Test RabbitMQ management UI
kubectl port-forward service/rabbitmq 15672:15672 &
# Visit http://localhost:15672 (guest/guest)
```

### Advanced Deployment Configurations

#### 1\. Production ConfigMaps and Secrets

**Production ConfigMap**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: gateway-config-prod
    namespace: production
data:
    RABBITMQ_HOST: rabbitmq.production.svc.cluster.local
    AUTH_SVC_ADDR: auth.production.svc.cluster.local:5000
    LOG_LEVEL: INFO
    MAX_FILE_SIZE: "104857600" # 100MB
    WORKER_PROCESSES: "4"
```

**Production Secrets (encrypted)**

```yaml
apiVersion: v1
kind: Secret
metadata:
    name: gateway-secrets-prod
    namespace: production
type: Opaque
data:
    MONGO_URI: <encrypted-base64-uri>
    MONGO_MP3_URI: <encrypted-base64-uri>
    JWT_SECRET: <encrypted-base64-secret>
```

#### 2\. Resource Management

**Resource Requests and Limits**

```yaml
resources:
    requests:
        memory: "256Mi"
        cpu: "250m"
    limits:
        memory: "512Mi"
        cpu: "500m"
```

**Quality of Service Classes**

* **Guaranteed**: requests = limits (critical services)
    
* **Burstable**: requests &lt; limits (most services)
    
* **BestEffort**: no requests or limits (non-critical)
    

#### 3\. Rolling Updates and Rollbacks

**Rolling Update Strategy**

```yaml
strategy:
    type: RollingUpdate
    rollingUpdate:
        maxUnavailable: 25%
        maxSurge: 25%
```

**Rollback Commands**

```bash
# Check rollout history
kubectl rollout history deployment/gateway

# Rollback to previous version
kubectl rollout undo deployment/gateway

# Rollback to specific revision
kubectl rollout undo deployment/gateway --to-revision=2

# Monitor rollout status
kubectl rollout status deployment/gateway
```

### CI/CD Pipeline Integration

#### GitHub Actions Example

**.github/workflows/deploy.yml**

```yaml
name: Deploy to Kubernetes

on:
    push:
        branches: [main]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2

            - name: Set up Python
              uses: actions/setup-python@v2
              with:
                  python-version: 3.11

            - name: Install dependencies
              run: |
                  pip install -r requirements.txt
                  pip install pytest pytest-cov

            - name: Run tests
              run: pytest tests/ --cov=./ --cov-report=xml

            - name: Upload coverage
              uses: codecov/codecov-action@v2

    build-and-deploy:
        needs: test
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'

        steps:
            - uses: actions/checkout@v2

            - name: Set up Docker Buildx
              uses: docker/setup-buildx-action@v1

            - name: Login to DockerHub
              uses: docker/login-action@v1
              with:
                  username: ${{ secrets.DOCKER_USERNAME }}
                  password: ${{ secrets.DOCKER_PASSWORD }}

            - name: Build and push images
              run: |
                  docker build -t ${{ secrets.DOCKER_USERNAME }}/auth:${{ github.sha }} auth_service/
                  docker push ${{ secrets.DOCKER_USERNAME }}/auth:${{ github.sha }}

                  docker build -t ${{ secrets.DOCKER_USERNAME }}/gateway:${{ github.sha }} gateway/
                  docker push ${{ secrets.DOCKER_USERNAME }}/gateway:${{ github.sha }}

            - name: Deploy to Kubernetes
              uses: azure/k8s-deploy@v1
              with:
                  manifests: |
                      auth_service/manifests/
                      gateway/manifests/
                  images: |
                      ${{ secrets.DOCKER_USERNAME }}/auth:${{ github.sha }}
                      ${{ secrets.DOCKER_USERNAME }}/gateway:${{ github.sha }}
```

---

## Testing and Monitoring

### Testing Strategy

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                        Testing Pyramid                         │
│                                                                 │
│                         ┌─────────┐                            │
│                         │   E2E   │                            │
│                         │  Tests  │                            │
│                         └─────────┘                            │
│                                                                 │
│                    ┌─────────────────────┐                     │
│                    │  Integration Tests  │                     │
│                    │                     │                     │
│                    └─────────────────────┘                     │
│                                                                 │
│            ┌─────────────────────────────────────┐             │
│            │           Unit Tests                │             │
│            │                                     │             │
│            └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 1\. Unit Testing

**Testing Framework Setup**

```python
# conftest.py - Shared test configuration
import pytest
import tempfile
import os
from unittest.mock import MagicMock

@pytest.fixture
def temp_file():
    """Create temporary file for testing"""
    fd, path = tempfile.mkstemp(suffix='.mp4')
    try:
        yield path
    finally:
        os.close(fd)
        os.unlink(path)

@pytest.fixture
def mock_mongodb():
    """Mock MongoDB connection"""
    mock_client = MagicMock()
    mock_db = MagicMock()
    mock_fs = MagicMock()

    mock_client.gateway_db = mock_db
    mock_db.fs = mock_fs

    return mock_client, mock_db, mock_fs

@pytest.fixture
def mock_rabbitmq():
    """Mock RabbitMQ connection"""
    mock_connection = MagicMock()
    mock_channel = MagicMock()

    mock_connection.channel.return_value = mock_channel

    return mock_connection, mock_channel
```

**Service-Specific Unit Tests**

**Auth Service Tests**

```python
# tests/test_auth_service.py
import pytest
import jwt
from datetime import datetime, timedelta
from auth_service.server import create_token, validate_jwt

class TestAuthService:
    def test_create_token(self):
        """Test JWT token creation"""
        secret = "test_secret"
        username = "test@example.com"
        is_admin = True

        token = create_token(username, secret, is_admin)

        # Verify token structure
        assert isinstance(token, str)
        assert len(token.split('.')) == 3  # header.payload.signature

        # Decode and verify payload
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        assert decoded['user_email'] == username
        assert decoded['is_admin'] == is_admin
        assert 'exp' in decoded
        assert 'iat' in decoded

    def test_validate_jwt_valid_token(self):
        """Test validation of valid JWT token"""
        secret = "test_secret"
        token = create_token("test@example.com", secret, True)

        result = validate_jwt(token, secret)

        assert result is not None
        assert result['user_email'] == "test@example.com"
        assert result['is_admin'] is True

    def test_validate_jwt_expired_token(self):
        """Test validation of expired JWT token"""
        secret = "test_secret"

        # Create expired token
        expired_payload = {
            'user_email': "test@example.com",
            'is_admin': True,
            'exp': datetime.utcnow() - timedelta(hours=1),  # Expired 1 hour ago
            'iat': datetime.utcnow() - timedelta(hours=2)
        }
        expired_token = jwt.encode(expired_payload, secret, algorithm='HS256')

        result = validate_jwt(expired_token, secret)
        assert result is None

    def test_validate_jwt_invalid_signature(self):
        """Test validation of token with invalid signature"""
        secret = "test_secret"
        wrong_secret = "wrong_secret"

        token = create_token("test@example.com", secret, True)
        result = validate_jwt(token, wrong_secret)

        assert result is None
```

**Gateway Service Tests**

```python
# tests/test_gateway_service.py
import pytest
import json
from unittest.mock import patch, MagicMock
from gateway.server import app

class TestGatewayService:
    @pytest.fixture
    def client(self):
        app.config['TESTING'] = True
        return app.test_client()

    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/health')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'status' in data
        assert 'mongodb' in data
        assert 'rabbitmq' in data

    @patch('gateway.server.validate.token')
    def test_upload_without_token(self, mock_validate, client):
        """Test upload without authentication token"""
        mock_validate.return_value = (None, ("Unauthorized", 401))

        response = client.post('/upload')

        assert response.status_code == 401
        assert b"Unauthorized" in response.data

    @patch('gateway.server.validate.token')
    @patch('gateway.server.util.upload')
    def test_upload_success(self, mock_upload, mock_validate, client):
        """Test successful file upload"""
        # Mock successful authentication
        mock_validate.return_value = ('{"user_email": "admin@test.com", "is_admin": true}', None)
        mock_upload.return_value = None  # No error

        # Create test file
        data = {
            'file': (BytesIO(b'fake video content'), 'test.mp4')
        }

        response = client.post('/upload', data=data, content_type='multipart/form-data')

        assert response.status_code == 200
        assert b"File uploaded successfully" in response.data
```

### 2\. Integration Testing

**Database Integration Tests**

```python
# tests/test_integration_database.py
import pytest
from pymongo import MongoClient
import mysql.connector
from gridfs import GridFS

class TestDatabaseIntegration:
    @pytest.fixture(scope="class")
    def mongodb_client(self):
        """Setup MongoDB test database"""
        client = MongoClient("mongodb://piush:password@localhost:27017/")
        test_db = client.test_gateway_db

        yield client, test_db

        # Cleanup
        client.drop_database("test_gateway_db")
        client.close()

    @pytest.fixture(scope="class")
    def mysql_connection(self):
        """Setup MySQL test database"""
        connection = mysql.connector.connect(
            host='localhost',
            user='piush',
            password='password',
            database='test_auth_db'
        )

        # Setup test schema
        cursor = connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        """)
        connection.commit()

        yield connection

        # Cleanup
        cursor.execute("DROP TABLE users")
        connection.commit()
        connection.close()

    def test_mongodb_file_storage(self, mongodb_client):
        """Test file storage in MongoDB GridFS"""
        client, db = mongodb_client
        fs = GridFS(db)

        # Store test file
        test_content = b"Test video content"
        file_id = fs.put(test_content, filename="test.mp4")

        # Retrieve file
        retrieved_file = fs.get(file_id)
        retrieved_content = retrieved_file.read()

        assert retrieved_content == test_content
        assert retrieved_file.filename == "test.mp4"

    def test_mysql_user_operations(self, mysql_connection):
        """Test user operations in MySQL"""
        cursor = mysql_connection.cursor()

        # Insert test user
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            ("test@example.com", "hashed_password")
        )
        mysql_connection.commit()

        # Retrieve user
        cursor.execute("SELECT email, password FROM users WHERE email = %s", ("test@example.com",))
        result = cursor.fetchone()

        assert result is not None
        assert result[0] == "test@example.com"
        assert result[1] == "hashed_password"
```

**Message Queue Integration Tests**

```python
# tests/test_integration_rabbitmq.py
import pytest
import pika
import json
import time
from threading import Thread

class TestRabbitMQIntegration:
    @pytest.fixture(scope="class")
    def rabbitmq_connection(self):
        """Setup RabbitMQ test connection"""
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='localhost')
        )
        channel = connection.channel()

        # Declare test queues
        channel.queue_declare(queue='test_video', durable=True)
        channel.queue_declare(queue='test_mp3', durable=True)

        yield connection, channel

        # Cleanup
        channel.queue_delete(queue='test_video')
        channel.queue_delete(queue='test_mp3')
        connection.close()

    def test_message_publishing_and_consuming(self, rabbitmq_connection):
        """Test message publishing and consuming"""
        connection, channel = rabbitmq_connection

        test_message = {
            "video_fid": "test_video_id",
            "mp3_fid": "test_mp3_id",
            "username": "test@example.com"
        }

        received_messages = []

        def callback(ch, method, properties, body):
            received_messages.append(json.loads(body))
            ch.basic_ack(delivery_tag=method.delivery_tag)

        # Setup consumer
        channel.basic_consume(
            queue='test_video',
            on_message_callback=callback
        )

        # Publish message
        channel.basic_publish(
            exchange='',
            routing_key='test_video',
            body=json.dumps(test_message),
            properties=pika.BasicProperties(delivery_mode=2)
        )

        # Start consuming in a separate thread
        def start_consuming():
            channel.start_consuming()

        consumer_thread = Thread(target=start_consuming)
        consumer_thread.daemon = True
        consumer_thread.start()

        # Wait for message to be processed
        time.sleep(2)
        channel.stop_consuming()

        assert len(received_messages) == 1
        assert received_messages[0] == test_message
```

### 3\. End-to-End Testing

**Complete Workflow Testing**

```python
# tests/test_e2e.py
import pytest
import requests
import time
import os
from base64 import b64encode

class TestEndToEndWorkflow:
    @pytest.fixture(scope="class")
    def test_setup(self):
        """Setup for E2E tests"""
        self.gateway_url = "http://localhost:8000"
        self.auth_url = "http://localhost:5000"
        self.test_user = "admin@example.com"
        self.test_password = "password"

    def test_complete_video_conversion_workflow(self, test_setup):
        """Test complete video conversion workflow"""

        # Step 1: Health checks
        auth_health = requests.get(f"{self.auth_url}/health")
        assert auth_health.status_code == 200

        gateway_health = requests.get(f"{self.gateway_url}/health")
        assert gateway_health.status_code == 200

        # Step 2: User authentication
        auth_header = b64encode(f"{self.test_user}:{self.test_password}".encode()).decode()
        login_response = requests.post(
            f"{self.auth_url}/login",
            headers={'Authorization': f'Basic {auth_header}'}
        )
        assert login_response.status_code == 200
        token = login_response.text

        # Step 3: File upload
        test_video_path = "tests/fixtures/sample_video.mp4"
        with open(test_video_path, 'rb') as video_file:
            upload_response = requests.post(
                f"{self.gateway_url}/upload",
                files={'file': ('test_video.mp4', video_file, 'video/mp4')},
                headers={'Authorization': f'Bearer {token}'}
            )
        assert upload_response.status_code == 200

        # Step 4: Wait for processing (with polling)
        max_wait_time = 120  # 2 minutes
        start_time = time.time()

        while time.time() - start_time < max_wait_time:
            # Check if conversion is complete
            # In a real implementation, you might check a status endpoint
            time.sleep(10)

        # Step 5: Verify email notification (mock check)
        # In production, you'd verify email was sent

        print("✅ End-to-end workflow completed successfully")
```

### Monitoring and Observability

#### 1\. Application Metrics

**Prometheus Metrics Integration**

```python
# utils/metrics.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import functools

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active database connections')
QUEUE_SIZE = Gauge('rabbitmq_queue_size', 'RabbitMQ queue size', ['queue_name'])

def track_requests(f):
    """Decorator to track HTTP requests"""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        start_time = time.time()

        try:
            result = f(*args, **kwargs)
            status = getattr(result, 'status_code', 200)
            REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint, status=status).inc()
            return result
        except Exception as e:
            REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint, status=500).inc()
            raise
        finally:
            REQUEST_LATENCY.observe(time.time() - start_time)

    return wrapper

# Usage in Flask app
@app.route('/upload', methods=['POST'])
@track_requests
def upload():
    # ... existing upload logic
    pass
```

**Custom Health Checks**

```python
# utils/health_checks.py
import requests
import pymongo
import mysql.connector
from datetime import datetime

class HealthChecker:
    def __init__(self):
        self.checks = {
            'database': self.check_database,
            'rabbitmq': self.check_rabbitmq,
            'external_services': self.check_external_services,
            'disk_space': self.check_disk_space,
            'memory_usage': self.check_memory_usage
        }

    def check_database(self):
        """Check database connectivity"""
        try:
            # Check MongoDB
            mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            mongo_client.admin.command('ping')

            # Check MySQL
            mysql_conn = mysql.connector.connect(
                host=MYSQL_HOST,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                database=MYSQL_DB
            )
            mysql_conn.close()

            return {'status': 'healthy', 'message': 'All databases accessible'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': f'Database error: {str(e)}'}

    def check_rabbitmq(self):
        """Check RabbitMQ connectivity"""
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST)
            )
            connection.close()
            return {'status': 'healthy', 'message': 'RabbitMQ accessible'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': f'RabbitMQ error: {str(e)}'}

    def run_all_checks(self):
        """Run all health checks"""
        results = {}
        overall_status = 'healthy'

        for check_name, check_func in self.checks.items():
            try:
                result = check_func()
                results[check_name] = result
                if result['status'] != 'healthy':
                    overall_status = 'unhealthy'
            except Exception as e:
                results[check_name] = {
                    'status': 'unhealthy',
                    'message': f'Check failed: {str(e)}'
                }
                overall_status = 'unhealthy'

        return {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_status': overall_status,
            'checks': results
        }

# Enhanced health endpoint
@app.route('/health/detailed', methods=['GET'])
def detailed_health():
    """Detailed health check endpoint"""
    health_checker = HealthChecker()
    results = health_checker.run_all_checks()

    status_code = 200 if results['overall_status'] == 'healthy' else 503
    return jsonify(results), status_code
```

#### 2\. Logging and Tracing

**Structured Logging with Correlation IDs**

```python
# utils/logging_setup.py
import logging
import uuid
from flask import request, g
import json

class CorrelationIdFilter(logging.Filter):
    """Add correlation ID to log records"""

    def filter(self, record):
        correlation_id = getattr(g, 'correlation_id', str(uuid.uuid4()))
        record.correlation_id = correlation_id
        return True

def setup_logging():
    """Setup structured logging with correlation IDs"""

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(correlation_id)s - %(message)s'
    )

    # Create handler
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    # Add correlation ID filter
    correlation_filter = CorrelationIdFilter()
    handler.addFilter(correlation_filter)

    # Setup root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)

@app.before_request
def before_request():
    """Set correlation ID for request tracking"""
    g.correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))

@app.after_request
def after_request(response):
    """Add correlation ID to response headers"""
    response.headers['X-Correlation-ID'] = g.correlation_id
    return response
```

#### 3\. Performance Monitoring

**Database Query Performance**

```python
# utils/db_monitoring.py
import time
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def monitor_db_query(operation_name):
    """Decorator to monitor database query performance"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()

            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time

                logger.info(
                    f"DB Query: {operation_name}",
                    extra={
                        'execution_time': execution_time,
                        'status': 'success',
                        'operation': operation_name
                    }
                )

                # Alert on slow queries
                if execution_time > 1.0:  # 1 second threshold
                    logger.warning(
                        f"Slow query detected: {operation_name}",
                        extra={'execution_time': execution_time}
                    )

                return result

            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(
                    f"DB Query Error: {operation_name}",
                    extra={
                        'execution_time': execution_time,
                        'status': 'error',
                        'error': str(e),
                        'operation': operation_name
                    }
                )
                raise

        return wrapper
    return decorator

# Usage
@monitor_db_query("user_login")
def authenticate_user(email, password):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    return cursor.fetchone()
```

---

## Troubleshooting Common Issues

### Diagnostic Framework

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                    Troubleshooting Workflow                     │
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ Problem │───▶│Diagnose │───▶│ Isolate │───▶│  Fix    │       │
│  │Reported │    │ Issue   │    │Component│    │ Issue   │       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Diagnostic Tools                        │    │
│  │                                                         │    │
│  │  • kubectl logs                                         │    │
│  │  • kubectl describe                                     │    │
│  │  • kubectl get events                                   │    │
│  │  • Service health endpoints                             │    │
│  │  • Database connectivity tests                          │    │
│  │  • Message queue inspection                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 1\. Pod Issues

#### CrashLoopBackOff

**Diagnosis Commands**

```bash
# Check pod status
kubectl get pods -l app=gateway

# Examine pod details
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name> --previous

# Get events
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Common Causes and Solutions**

**1\. Database Connection Issues**

```bash
# Test database connectivity
kubectl run debug-pod --image=alpine --rm -it -- sh

# Inside the debug pod:
apk add --no-cache mysql-client
mysql -h host.minikube.internal -u piush -p

# Test MongoDB
apk add --no-cache mongodb-tools
mongosh "mongodb://piush:password@host.minikube.internal:27017/gateway_db"
```

**2\. Missing Environment Variables**

```bash
# Check ConfigMap
kubectl get configmap gateway-config -o yaml

# Check Secret
kubectl get secret gateway-secrets -o yaml

# Verify pod environment
kubectl exec <pod-name> -- env | grep -E "(MONGO|MYSQL|RABBITMQ)"
```

**3\. Resource Constraints**

```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Check resource limits
kubectl describe pod <pod-name> | grep -A 10 "Limits:"
```

#### Image Pull Issues

**Diagnosis**

```bash
# Check image pull status
kubectl describe pod <pod-name> | grep -A 5 "Events:"

# Verify image exists
minikube image ls | grep devpiush

# Pull image manually
docker pull devpiush/python-microservice-gateway:latest
minikube image load devpiush/python-microservice-gateway:latest
```

### 2\. Service Communication Issues

#### Service Discovery Problems

**Debug Service Connectivity**

```bash
# Create debug pod
kubectl run debug --image=nicolaka/netshoot --rm -it

# Inside debug pod:
# Test DNS resolution
nslookup auth.default.svc.cluster.local
nslookup rabbitmq.default.svc.cluster.local

# Test service connectivity
curl http://auth:5000/health
curl http://gateway:8000/health

# Check port connectivity
telnet auth 5000
telnet rabbitmq 5672
```

**Service Configuration Check**

```bash
# Check service endpoints
kubectl get endpoints

# Verify service selectors
kubectl get service auth -o yaml | grep -A 5 selector

# Check if pods match selector
kubectl get pods -l app=auth --show-labels
```

#### RabbitMQ Connection Issues

**RabbitMQ Diagnostics**

```bash
# Check RabbitMQ pod logs
kubectl logs -l app=rabbitmq

# Access RabbitMQ management UI
kubectl port-forward service/rabbitmq 15672:15672

# Check queue status via management API
curl -u guest:guest http://localhost:15672/api/queues

# Test connection from consumer pods
kubectl exec -it <converter-pod> -- python -c "
import pika
connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
print('Connected successfully')
connection.close()
"
```

### 3\. Database Issues

#### MongoDB Connection Problems

**MongoDB Diagnostics**

```bash
# Test MongoDB connectivity
kubectl run mongo-debug --image=mongo:7.0 --rm -it -- \
  mongosh "mongodb://piush:password@host.minikube.internal:27017/gateway_db?authSource=admin"

# Check GridFS collections
db.fs.files.find().limit(5)
db.fs.chunks.find().limit(5)

# Check database sizes
db.stats()
```

**Common MongoDB Issues**

1. **Authentication failure**: Check username/password in secrets
    
2. **Network connectivity**: Verify host.minikube.internal resolves
    
3. **GridFS corruption**: Run database repair commands
    
4. **Disk space**: Check available storage
    

#### MySQL Connection Problems

**MySQL Diagnostics**

```bash
# Test MySQL connectivity
kubectl run mysql-debug --image=mysql:8.0 --rm -it -- \
  mysql -h host.minikube.internal -u piush -p auth_db

# Check user permissions
SHOW GRANTS FOR 'piush'@'%';

# Verify table structure
DESCRIBE users;

# Check connection limits
SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS LIKE 'Threads_connected';
```

### 4\. Performance Issues

#### High Latency Diagnosis

**Application Performance Profiling**

```python
# utils/profiler.py
import cProfile
import pstats
from functools import wraps
from flask import request

def profile_endpoint(func):
    """Profile endpoint performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if request.args.get('profile') == 'true':
            profiler = cProfile.Profile()
            profiler.enable()

            result = func(*args, **kwargs)

            profiler.disable()
            stats = pstats.Stats(profiler)
            stats.sort_stats('cumulative')
            stats.print_stats(20)  # Top 20 functions

            return result
        else:
            return func(*args, **kwargs)

    return wrapper

# Usage
@app.route('/upload')
@profile_endpoint
def upload():
    # ... existing code
    pass
```

**Database Query Optimization**

```sql
-- Check slow queries in MySQL
SELECT * FROM information_schema.processlist WHERE time > 10;

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Analyze query performance
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Memory Issues

**Memory Usage Monitoring**

```bash
# Check pod memory usage
kubectl top pods

# Check detailed resource usage
kubectl describe pod <pod-name> | grep -A 10 "Requests:\|Limits:"

# Monitor memory inside pod
kubectl exec <pod-name> -- cat /proc/meminfo
kubectl exec <pod-name> -- ps aux --sort=-%mem | head -10
```

**Memory Leak Detection**

```python
# utils/memory_monitor.py
import psutil
import threading
import time
import logging

logger = logging.getLogger(__name__)

class MemoryMonitor:
    def __init__(self, threshold_mb=500, check_interval=60):
        self.threshold_mb = threshold_mb
        self.check_interval = check_interval
        self.monitoring = False

    def start_monitoring(self):
        """Start memory monitoring in background thread"""
        self.monitoring = True
        monitor_thread = threading.Thread(target=self._monitor_memory)
        monitor_thread.daemon = True
        monitor_thread.start()

    def _monitor_memory(self):
        """Monitor memory usage"""
        while self.monitoring:
            process = psutil.Process()
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024

            logger.info(f"Memory usage: {memory_mb:.2f} MB")

            if memory_mb > self.threshold_mb:
                logger.warning(
                    f"High memory usage detected: {memory_mb:.2f} MB "
                    f"(threshold: {self.threshold_mb} MB)"
                )

            time.sleep(self.check_interval)

# Initialize in application
memory_monitor = MemoryMonitor()
memory_monitor.start_monitoring()
```

### 5\. File Processing Issues

#### Video Conversion Failures

**FFmpeg Debugging**

```python
# converter/debug_converter.py
import subprocess
import logging

logger = logging.getLogger(__name__)

def debug_video_conversion(input_path, output_path):
    """Debug video conversion with detailed logging"""

    # Get video information
    ffprobe_cmd = [
        'ffprobe', '-v', 'quiet', '-print_format', 'json',
        '-show_format', '-show_streams', input_path
    ]

    try:
        result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
        logger.info(f"Video info: {result.stdout}")
    except Exception as e:
        logger.error(f"FFprobe failed: {e}")

    # Convert with verbose logging
    ffmpeg_cmd = [
        'ffmpeg', '-i', input_path, '-vn', '-acodec', 'libmp3lame',
        '-ab', '192k', '-ar', '44100', '-f', 'mp3', output_path, '-y'
    ]

    try:
        result = subprocess.run(
            ffmpeg_cmd, capture_output=True, text=True, timeout=300
        )

        if result.returncode == 0:
            logger.info("Video conversion successful")
            return True
        else:
            logger.error(f"FFmpeg error: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        logger.error("Video conversion timed out")
        return False
    except Exception as e:
        logger.error(f"Video conversion failed: {e}")
        return False
```

### 6\. Automated Recovery

**Self-Healing Mechanisms**

```python
# utils/recovery.py
import time
import logging
from threading import Thread

logger = logging.getLogger(__name__)

class AutoRecovery:
    def __init__(self):
        self.recovery_strategies = {
            'database_connection': self.recover_database_connection,
            'rabbitmq_connection': self.recover_rabbitmq_connection,
            'memory_cleanup': self.cleanup_memory
        }

    def recover_database_connection(self):
        """Attempt to recover database connection"""
        try:
            # Recreate database connections
            logger.info("Attempting database recovery...")

            # Close existing connections
            if hasattr(self, 'mysql_connection'):
                self.mysql_connection.close()

            # Recreate connections with retry logic
            self.mysql_connection = self.create_mysql_connection_with_retry()

            logger.info("Database recovery successful")
            return True

        except Exception as e:
            logger.error(f"Database recovery failed: {e}")
            return False

    def recover_rabbitmq_connection(self):
        """Attempt to recover RabbitMQ connection"""
        try:
            logger.info("Attempting RabbitMQ recovery...")

            # Close existing connection
            if hasattr(self, 'rabbitmq_connection'):
                self.rabbitmq_connection.close()

            # Recreate connection
            self.rabbitmq_connection = self.create_rabbitmq_connection_with_retry()

            logger.info("RabbitMQ recovery successful")
            return True

        except Exception as e:
            logger.error(f"RabbitMQ recovery failed: {e}")
            return False

    def cleanup_memory(self):
        """Cleanup memory to prevent OOM issues"""
        try:
            import gc
            gc.collect()
            logger.info("Memory cleanup completed")
            return True
        except Exception as e:
            logger.error(f"Memory cleanup failed: {e}")
            return False
```

---

## Production Considerations

### Security Hardening

#### 1\. Container Security

**Secure Dockerfile Practices**

```dockerfile
# Use specific version tags
FROM python:3.11.5-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install security updates
RUN apt-get update && apt-get install -y --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=appuser:appuser . /app
WORKDIR /app

# Switch to non-root user
USER appuser

# Set security headers
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["gunicorn", "--config", "gunicorn.conf.py", "server:app"]
```

**Security Scanning**

```bash
# Scan Docker images for vulnerabilities
trivy image devpiush/python-microservice-gateway:latest

# Scan Kubernetes manifests
kube-score score gateway/manifests/*.yaml

# Run security benchmarks
kubectl run --rm -it kube-bench --image=aquasec/kube-bench:latest --restart=Never
```

#### 2\. Network Security

**Network Policies for Production**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: production-network-policy
    namespace: production
spec:
    podSelector: {}
    policyTypes:
        - Ingress
        - Egress
    ingress:
        - from:
              - namespaceSelector:
                    matchLabels:
                        name: production
    egress:
        - to:
              - namespaceSelector:
                    matchLabels:
                        name: production
        - to: []
          ports:
              - protocol: TCP
                port: 53 # DNS
              - protocol: UDP
                port: 53 # DNS
```

**TLS/SSL Configuration**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: gateway-ingress
    annotations:
        nginx.ingress.kubernetes.io/ssl-redirect: "true"
        nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
        cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
    tls:
        - hosts:
              - api.yourcompany.com
          secretName: gateway-tls
    rules:
        - host: api.yourcompany.com
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: gateway
                            port:
                                number: 8000
```

### Scalability and Performance

#### 1\. Horizontal Pod Autoscaling

**Advanced HPA Configuration**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
    name: gateway-hpa
spec:
    scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: gateway
    minReplicas: 3
    maxReplicas: 20
    metrics:
        - type: Resource
          resource:
              name: cpu
              target:
                  type: Utilization
                  averageUtilization: 70
        - type: Resource
          resource:
              name: memory
              target:
                  type: Utilization
                  averageUtilization: 80
        - type: Pods
          pods:
              metric:
                  name: pending_requests
              target:
                  type: AverageValue
                  averageValue: "10"
    behavior:
        scaleDown:
            stabilizationWindowSeconds: 300
            policies:
                - type: Percent
                  value: 10
                  periodSeconds: 60
        scaleUp:
            stabilizationWindowSeconds: 0
            policies:
                - type: Percent
                  value: 100
                  periodSeconds: 15
                - type: Pods
                  value: 4
                  periodSeconds: 15
            selectPolicy: Max
```

#### 2\. Database Optimization

**MongoDB Performance Tuning**

```javascript
// Create indexes for better query performance
db.fs.files.createIndex({ "metadata.user_email": 1 });
db.fs.files.createIndex({ uploadDate: 1 });
db.fs.files.createIndex({ filename: 1 });

// Enable sharding for large datasets
sh.enableSharding("gateway_db");
sh.shardCollection("gateway_db.fs.files", { _id: "hashed" });

// Configure read preferences
db.fs.files.find().readPref("secondaryPreferred");
```

**MySQL Performance Optimization**

```sql
-- Optimize MySQL configuration
SET GLOBAL innodb_buffer_pool_size = 1073741824;  -- 1GB
SET GLOBAL query_cache_size = 268435456;  -- 256MB
SET GLOBAL max_connections = 500;

-- Create optimal indexes
CREATE INDEX idx_users_email_active ON users(email, active);
CREATE INDEX idx_sessions_user_expires ON user_sessions(user_id, expires_at);

-- Analyze query performance
ANALYZE TABLE users;
OPTIMIZE TABLE users;
```

#### 3\. Caching Strategy

**Redis Cache Implementation**

```python
# utils/cache.py
import redis
import json
import hashlib
from functools import wraps

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

def cache_result(expiration=300):
    """Cache function results in Redis"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key
            key_data = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            cache_key = hashlib.md5(key_data.encode()).hexdigest()

            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)

            # Execute function and cache result
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))

            return result
        return wrapper
    return decorator

# Usage
@cache_result(expiration=600)  # Cache for 10 minutes
def get_user_profile(user_email):
    # Expensive database query
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email=%s", (user_email,))
    return cursor.fetchone()
```

### Backup and Disaster Recovery

#### 1\. Database Backup Strategy

**Automated Backup System**

```bash
#!/bin/bash
# backup.sh - Automated backup script

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# MongoDB backup
echo "Starting MongoDB backup..."
mongodump --host host.minikube.internal:27017 \
         --username piush \
         --password password \
         --out "$BACKUP_DIR/mongodb_$TIMESTAMP"

# MySQL backup
echo "Starting MySQL backup..."
mysqldump --host host.minikube.internal \
         --user piush \
         --password=password \
         --all-databases > "$BACKUP_DIR/mysql_$TIMESTAMP.sql"

# Compress backups
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
    "$BACKUP_DIR/mongodb_$TIMESTAMP" \
    "$BACKUP_DIR/mysql_$TIMESTAMP.sql"

# Upload to cloud storage (example with AWS S3)
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
    s3://your-backup-bucket/backups/

# Cleanup old local backups (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed successfully"
```

**Kubernetes CronJob for Backups**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
    name: database-backup
spec:
    schedule: "0 2 * * *" # Daily at 2 AM
    jobTemplate:
        spec:
            template:
                spec:
                    containers:
                        - name: backup
                          image: backup-tool:latest
                          command:
                              - /bin/bash
                              - /scripts/backup.sh
                          env:
                              - name: AWS_ACCESS_KEY_ID
                                valueFrom:
                                    secretKeyRef:
                                        name: aws-credentials
                                        key: access-key-id
                          volumeMounts:
                              - name: backup-scripts
                                mountPath: /scripts
                              - name: backup-storage
                                mountPath: /backups
                    volumes:
                        - name: backup-scripts
                          configMap:
                              name: backup-scripts
                        - name: backup-storage
                          persistentVolumeClaim:
                              claimName: backup-pvc
                    restartPolicy: OnFailure
```

#### 2\. Disaster Recovery Plan

**Recovery Procedures**

```bash
#!/bin/bash
# disaster_recovery.sh - Disaster recovery script

set -e

BACKUP_FILE=$1
RECOVERY_DIR="/recovery"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting disaster recovery from $BACKUP_FILE"

# Extract backup
tar -xzf "$BACKUP_FILE" -C "$RECOVERY_DIR"

# Restore MongoDB
echo "Restoring MongoDB..."
mongorestore --host host.minikube.internal:27017 \
            --username piush \
            --password password \
            --drop \
            "$RECOVERY_DIR/mongodb_*/gateway_db"

# Restore MySQL
echo "Restoring MySQL..."
mysql --host host.minikube.internal \
      --user piush \
      --password=password < "$RECOVERY_DIR/mysql_*.sql"

# Verify data integrity
echo "Verifying data integrity..."
python verify_data_integrity.py

echo "Disaster recovery completed successfully"
```

### Monitoring and Alerting

#### 1\. Prometheus and Grafana Setup

**Prometheus Configuration**

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: prometheus-config
data:
    prometheus.yml: |
        global:
          scrape_interval: 15s

        scrape_configs:
        - job_name: 'kubernetes-pods'
          kubernetes_sd_configs:
          - role: pod
          relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)

        - job_name: 'gateway-service'
          static_configs:
          - targets: ['gateway:8000']
          metrics_path: /metrics
          scrape_interval: 10s

        - job_name: 'auth-service'
          static_configs:
          - targets: ['auth:5000']
          metrics_path: /metrics
          scrape_interval: 10s
```

**Alert Rules**

```yaml
# alert-rules.yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: alert-rules
data:
    alert_rules.yml: |
        groups:
        - name: microservices-alerts
          rules:
          - alert: HighErrorRate
            expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.1
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High error rate detected"
              description: "Error rate is above 10% for 5 minutes"

          - alert: PodCrashLooping
            expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "Pod is crash looping"
              description: "Pod {{ $labels.pod }} is restarting frequently"

          - alert: DatabaseConnectionLoss
            expr: up{job="mysql"} == 0 or up{job="mongodb"} == 0
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "Database connection lost"
              description: "Cannot connect to database"

          - alert: QueueBacklog
            expr: rabbitmq_queue_messages > 1000
            for: 10m
            labels:
              severity: warning
            annotations:
              summary: "Message queue backlog"
              description: "Queue {{ $labels.queue }} has {{ $value }} messages"
```

#### 2\. Log Aggregation

**ELK Stack Integration**

```yaml
# filebeat-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: filebeat-config
data:
    filebeat.yml: |
        filebeat.inputs:
        - type: container
          paths:
            - /var/log/containers/*gateway*.log
            - /var/log/containers/*auth*.log
            - /var/log/containers/*converter*.log
            - /var/log/containers/*notification*.log
          processors:
            - add_kubernetes_metadata:
                host: ${NODE_NAME}
                matchers:
                - logs_path:
                    logs_path: "/var/log/containers/"

        output.elasticsearch:
          hosts: ["elasticsearch:9200"]
          index: "microservices-%{+yyyy.MM.dd}"

        setup.template.name: "microservices"
        setup.template.pattern: "microservices-*"
```

---

## Conclusion

Building a production-ready microservices application requires careful consideration of multiple aspects: architecture design, service communication, data management, security, deployment, and monitoring. Through this comprehensive guide, we've explored how to create a scalable video-to-audio converter using modern cloud-native technologies.

### Key Takeaways

#### 1\. Architecture Principles

* **Single Responsibility**: Each service has a clear, focused purpose
    
* **Loose Coupling**: Services communicate through well-defined APIs
    
* **Event-Driven Design**: Asynchronous processing improves scalability
    
* **Fault Tolerance**: System gracefully handles component failures
    

#### 2\. Technology Choices

* **Python/Flask**: Rapid development and extensive ecosystem
    
* **MongoDB GridFS**: Efficient large file storage
    
* **MySQL**: ACID compliance for critical user data
    
* **RabbitMQ**: Reliable message queuing
    
* **Kubernetes**: Container orchestration and management
    

#### 3\. Production Readiness

* **Security**: Multi-layer security implementation
    
* **Monitoring**: Comprehensive observability and alerting
    
* **Scalability**: Horizontal scaling capabilities
    
* **Reliability**: Backup and disaster recovery procedures
    

### Next Steps for Enhancement

#### 1\. Advanced Features

```python
# Potential enhancements
├── Authentication
│   ├── OAuth2/OIDC Integration
│   ├── Multi-factor Authentication
│   └── Social Login (Google, GitHub)
├── Processing
│   ├── Multiple Audio Formats (WAV, FLAC, AAC)
│   ├── Video Preprocessing (Compression, Format Conversion)
│   └── Batch Processing Capabilities
├── Storage
│   ├── Cloud Storage Integration (S3, GCS, Azure Blob)
│   ├── CDN for File Distribution
│   └── Automatic Cleanup Policies
└── User Experience
    ├── Web UI for File Management
    ├── Progress Tracking
    └── Download History
```

#### 2\. Advanced Deployment

* **Multi-region deployment** for global availability
    
* **Blue-green deployments** for zero-downtime updates
    
* **Canary releases** for safer production rollouts
    
* **GitOps workflows** with ArgoCD or Flux
    

#### 3\. Enhanced Monitoring

* **Distributed tracing** with Jaeger or Zipkin
    
* **Application Performance Monitoring** (APM)
    
* **Business metrics** and KPI dashboards
    
* **Synthetic monitoring** for proactive issue detection
    

### Learning Resources

#### Documentation

* [Kubernetes Official Documentation](https://kubernetes.io/docs/)
    
* [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
    
* [Flask Documentation](https://flask.palletsprojects.com/)
    
* [MongoDB Documentation](https://docs.mongodb.com/)
    
* [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials.html)
    

#### Tools and Platforms

* [Minikube](https://minikube.sigs.k8s.io/docs/) for local development
    
* [Helm](https://helm.sh/) for Kubernetes package management
    
* [Prometheus](https://prometheus.io/) for monitoring
    
* [Grafana](https://grafana.com/) for visualization
    
* [Docker Hub](https://hub.docker.com/) for container registry
    

### Final Thoughts

Microservices architecture, while powerful, comes with complexity that must be carefully managed. The key to success lies in starting simple, implementing strong foundations (monitoring, security, testing), and evolving the system incrementally based on real-world feedback and requirements.

This video-to-audio converter serves as a practical example of how to apply microservices principles, but the patterns and practices demonstrated here can be adapted to virtually any distributed system requirements.

Remember: **Perfect is the enemy of good**. Start with a working system, implement proper monitoring and testing, then iterate and improve based on actual usage patterns and business needs.