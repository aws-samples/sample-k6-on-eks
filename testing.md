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


## Running K6 Tests
The final step to running K6 is to create a TestRun that will be scheduled to the `k6-load` NodePool based on the configured toleration; in this example, both the `initializer` and `runner` Pods will be scheduled to the `k6-load` NodePool. There are 3 different types of Pod that K6 will run in total - the controller manager, the initializer, and the test Pods.

```yaml filename="k6-testrun.yaml
---
apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: k6-testrun
  namespace: k6-operator-system
spec:
  initializer:
    affinity:
      nodeAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
          - matchExpressions:
            - key: "k6-load"
              operator: In
              values:
              - "true"
    tolerations:
    - key: "k6-load"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"
  runner:
    affinity:
      nodeAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
          - matchExpressions:
            - key: "k6-load"
              operator: In
              values:
              - "true"
    tolerations:
    - key: "k6-load"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"
    resources:
      requests:
        memory: "25Gi"
        cpu: "5"
      limits:
        memory: "25Gi"
        cpu: "5"
  parallelism: 15
  script:
    configMap:
      name: k6-stress-test
      file: k6.js
```

Once the manifest is applied to the cluster, the K6 Operator will begin requesting Pods to setup the initializer, which will be responsible in turn for starting the testing Pods:
```bash
❯ kubectl --namespace k6-operator-system get pods
NAME                                                  READY   STATUS      RESTARTS   AGE
pod/k6-operator-controller-manager-597fc64fdf-x5x7n   1/1     Running     0          6m41s
pod/k6-testrun-starter-fwd9b                          0/1     Completed   0          3m1s
pod/k6-testrun-1-fztlf                                1/1     Running     0          4m
pod/k6-testrun-10-qqmsx                               1/1     Running     0          3m59s
pod/k6-testrun-11-pbbtc                               1/1     Running     0          3m59s
pod/k6-testrun-12-5br5v                               1/1     Running     0          3m59s
pod/k6-testrun-13-hqpt2                               1/1     Running     0          3m59s
pod/k6-testrun-14-2j8bs                               1/1     Running     0          3m59s
pod/k6-testrun-15-2dpj7                               1/1     Running     0          3m59s
pod/k6-testrun-2-g5dzt                                1/1     Running     0          4m
pod/k6-testrun-3-gp2bf                                1/1     Running     0          4m
pod/k6-testrun-4-nfxmb                                1/1     Running     0          4m
pod/k6-testrun-5-6w6fx                                1/1     Running     0          4m
pod/k6-testrun-6-nbjnc                                1/1     Running     0          3m59s
pod/k6-testrun-7-wcwh6                                1/1     Running     0          3m59s
pod/k6-testrun-8-vh4m4                                1/1     Running     0          3m59s
pod/k6-testrun-9-7d6gb                                1/1     Running     0          3m59s
```

```bash
❯ kubectl --namespace k6-operator-system get jobs
NAME                               STATUS     COMPLETIONS   DURATION   AGE
job.batch/k6-testrun-initializer   Complete   1/1           5s         4m4s
job.batch/k6-testrun-starter       Complete   1/1           6s         3m1s
job.batch/k6-testrun-1             Running    0/1           4m         4m
job.batch/k6-testrun-10            Running    0/1           3m59s      3m59s
job.batch/k6-testrun-11            Running    0/1           3m59s      3m59s
job.batch/k6-testrun-12            Running    0/1           3m59s      3m59s
job.batch/k6-testrun-13            Running    0/1           3m59s      3m59s
job.batch/k6-testrun-14            Running    0/1           3m59s      3m59s
job.batch/k6-testrun-15            Running    0/1           3m59s      3m59s
job.batch/k6-testrun-2             Running    0/1           4m         4m
job.batch/k6-testrun-3             Running    0/1           4m         4m
job.batch/k6-testrun-4             Running    0/1           4m         4m
job.batch/k6-testrun-5             Running    0/1           4m         4m
job.batch/k6-testrun-6             Running    0/1           3m59s      3m59s
job.batch/k6-testrun-7             Running    0/1           3m59s      3m59s
job.batch/k6-testrun-8             Running    0/1           3m59s      3m59s
job.batch/k6-testrun-9             Running    0/1           3m59s      3m59s
```

Once the test completes, you can find the results in the Pod log:
```bash
❯ kubectl --namesapce k6-operator-system logs --follow k6-testrun-1-fztlf

    TOTAL RESULTS

    HTTP
    http_req_duration.......................................................: avg=792.1µs min=559.91µs med=706.44µs max=416.86ms p(90)=767.26µs p(95)=803.19µs
      { expected_response:true }............................................: avg=792.1µs min=559.91µs med=706.44µs max=416.86ms p(90)=767.26µs p(95)=803.19µs
    http_req_failed.........................................................: 0.00%  0 out of 40195
    http_reqs...............................................................: 40195  16.677188/s

    EXECUTION
    iteration_duration......................................................: avg=1s      min=1s       med=1s       max=1.41s    p(90)=1s       p(95)=1s
    iterations..............................................................: 40195  16.677188/s
    vus.....................................................................: 3      min=0          max=34
    vus_max.................................................................: 34     min=34         max=34

    NETWORK
    data_received...........................................................: 15 MB  6.1 kB/s
    data_sent...............................................................: 2.8 MB 1.2 kB/s
```

You calso find the requests generated by K6 in the NGINX logs via the Pod or a centralized log aggregation service such as [CloudWatch](https://aws.amazon.com/cloudwatch/):
```bash
{remote_addr:10.11.29.215	"time_local":"26/Jul/2025:19:12:55 +0000","remote_addr":"10.11.29.215","remote_user":"","request":"GET / HTTP/1.1","status": "200","body_bytes_sent":"129","http_referrer":"","http_user_agent":"Grafana k6/1.1.0","request_time":"0.000",}
```
