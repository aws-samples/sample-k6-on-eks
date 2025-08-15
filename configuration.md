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


## Configuration of EKS
In the installation steps we allowed Pods to run on any available Node and allowed Karpenter to scale capacity accordingly. In this section, we'll add a new [Karpenter NodePool](https://karpenter.sh/docs/concepts/nodepools/) that will provide capacity for K6 TestRun Pods and **only** those Pods; we'll accomplish this by using [Kubernetes taints](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/).

The full code can be found in this repository in the file `k6-nodepool.yaml`, but a snippet is included below:
```yaml filename="k6-nodepool.yaml"
---
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: k6-load
  ...
spec:
  ...
  template:
    metadata:
      labels:
        k6-load: "true"
    spec:
      ...
      taints:
      - key: k6-load
        value: "true"
        effect: NoSchedule
```

Now create the NodePool:
```bash
kubectl apply -f k6-nodepool.yaml
```

Verify that the installation was successful:
```bash
❯ kubectl get nodepool k6-load

NAME      NODECLASS   NODES   READY   AGE
k6-load   default     0       True    16d
```

## Configuration of K6
K6 makes a wide variety of test configurations possible - refer to the [Get started documentation](https://grafana.com/docs/k6/latest/get-started/write-your-first-test/) - below is an example that connects to the NGINX service created earlier using a ramp-up / ramp-down strategy:
```js filename="k6.js"
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 50 },
    { duration: '35m', target: 500 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
// replace with appropriate Kubernetes Service(s)
  http.get('http://nginx.default');
  sleep(1);
}
```

Create a [Kubernetes ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) from the configuration file:
```bash
❯ kubectl create configmap --namespace k6-operator-system k6-stress-test --from-file k6.js --dry-run=client -o yaml | k apply -f -
```

The ConfigMap above will be used by the TestRun in order to configure K6 in each of the Kubernetes Pods.
