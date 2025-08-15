<!-- markdownlint-disable MD041 -->
<div align="center">
  <a href="https://github.com/aws-samples" target="_blank" rel="noopener noreferrer">
    <picture>
      <img width="160" src="docs/images/eks.png" alt="Amazon Elastic Kubernetes Service logo">
    </picture>
  </a>
  
  <br/>

<div align="center">
  <strong>
  <h2>K6-on-EKS</h2>
  </strong>
</div>
</div>


## Installation of K6 on EKS
K6 includes an [Operator for Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that supports distributing K6 testing [Pods](https://kubernetes.io/docs/concepts/workloads/pods/), launched via [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/), across a Kubernetes cluster to achieve large scale and support diverse connection patterns, such as cross-AZ connections, to produce more comprehensive results.

These instructions are based on the upstream [documentation from K6](https://grafana.com/docs/k6/latest/set-up/set-up-distributed-k6/install-k6-operator/).

The infrastructure used in testing is an [EKS Auto Mode](https://aws.amazon.com/eks/auto-mode/) cluster. Although this is not a requirement - any EKS cluster running [Karpenter](https://karpenter.sh/) will be capable of implementing this sample - Auto Mode clusters include Kaprnter out-of-the-box which is a convenient time-saver (and why these instructions won't include installation and setup of Karpenter itself).


Begin by installing the K6 Operator into the `k6-operator-system` Namespace:
```bash
❯ curl https://raw.githubusercontent.com/grafana/k6-operator/main/bundle.yaml | kubectl apply -f -
```

Verify that the installation was successful:
```bash
❯ kubectl get customresourcedefinition testruns.k6.io

NAME             CREATED AT
testruns.k6.io   2025-07-09T23:08:12Z
```

## Installation of Target Workload (optional)
K6 makes connections out to other endpoints, such as HTTP servers, so to have a fully-functional test suite we'll install a simple NGINX target workload.

The code is provided in a YAML file in this repository:
```bash
❯ kubectl --namespace default apply -f nginx-deployment.yaml
```

Verify that the new NGINX service and Pods are running:
```bash
❯ kubectl --namespace default get service,pods -l app=nginx

NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/nginx   ClusterIP   172.20.81.253   <none>        80/TCP    8s

NAME                         READY   STATUS              RESTARTS   AGE
pod/nginx-7695f4bbb7-2v76k   1/1     Running             0          8s
pod/nginx-7695f4bbb7-9tzdw   1/1     Running             0          8s
pod/nginx-7695f4bbb7-c62mk   1/1     Running             0          8s
pod/nginx-7695f4bbb7-ffkkn   1/1     Running             0          8s
pod/nginx-7695f4bbb7-fvqwf   1/1     Running             0          8s
pod/nginx-7695f4bbb7-kc9sm   1/1     Running             0          8s
pod/nginx-7695f4bbb7-mpfmg   1/1     Running             0          8s
pod/nginx-7695f4bbb7-shxq4   1/1     Running             0          8s
pod/nginx-7695f4bbb7-sx9lm   0/1     ContainerCreating   0          8s
pod/nginx-7695f4bbb7-x4plz   1/1     Running             0          8s
```
