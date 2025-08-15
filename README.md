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


Welcome to the repository for running [Grafana K6](https://k6.io/) on [Amazon Elastic Kubernetes Services](https://aws.amazon.com/eks/) clusters. This repository contains the source for allocating dedicated, scalable capacity to support load generation as well as instructions for how to install, configure, and run K6 tests.


## Introduction
Grafana K6 is an open source tool for performing load testing, smoke testing, and functional testing. These capabilities can also be combined to perform load-driven functional testing or benchmarking.

K6 includes an [Operator for Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that supports distributing K6 testing [Pods](https://kubernetes.io/docs/concepts/workloads/pods/), launched via [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/), across a Kubernetes cluster to achieve large scale and support diverse connection patterns, such as cross-AZ connections, to produce more comprehensive results.

## Navigating the repository
- Installation Instructions: [installation.md]()
- Configuration Instructions: [configuration.md]()
- Testing Instructions: [testing.md]()

## Note on Security
The Kubernetes manifest data provided in the repository is only for the purposes of example; for production workloads, it is important to always follow the [best practice guidelines](https://docs.aws.amazon.com/eks/latest/best-practices/security.html) in accordance with your organization policies and procedures.
