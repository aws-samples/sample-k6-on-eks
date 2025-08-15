import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
//  iterations: 10,
//  vus: 5,
//  duration: '10s'
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
