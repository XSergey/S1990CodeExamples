<?php

App::uses('RealconnexController', 'Controller');

/**
 * Application Controller
 *
 * @property SessionComponent    $Session
 * @property MessengerComponent  $Messenger
 * @property SimpleAuthComponent $SimpleAuth
 */
class AppController extends RealconnexController
{
    public $theme = 'Realconnex';

    public $currentUserID;

    public $page = array();

    public $components = [
        'DebugKit.Toolbar', 'Session', 'Messenger', 'SimpleAuth', 'Cookie',
        'Auth' => [
            'authError' => 'Please log into the site.',
            'authorize' => ['Controller']
        ]
    ];

    public $helpers = array('Session', 'Html', 'Form', 'Number', 'Time', 'Minify.Minify');

    public $viewBlocks = [
        'default' => ['headerBar', 'leftSidebar', 'bottom'],
        'landing' => ['registration'],
        'public'  => ['registration']
    ];

    public function beforeFilter()
    {
        parent::beforeFilter();
        $this->SimpleAuth->initAuth();
        $this->initConfig();

        $this->set('base_url', 'http://' . $_SERVER['SERVER_NAME'] . Router::url('/'));
        if (isset($_GET['takeTour'])) {
            $this->set('takeTour', true);
            $this->set('takeTourStep', $_GET['takeTour']);
        } else {
            $this->set('takeTour', false);
        }
    }

    public function beforeRender()
    {
        if (!$this->request->is('ajax')) {
            if (!$this->Auth->user()) {
                if (!$this instanceof CakeErrorController) {
                    $this->renderLoginLinkedIn();
                }
            } else {
                $this->getNews();
            }
        }

        parent::beforeRender();
    }

    private function renderLoginLinkedIn()
    {
        $html = new CakeEvent('User.render.loginLinkedIn', $this);
        $this->getEventManager()->dispatch($html);
        $this->set('loginLinkedInHtml', $html->result);
    }

    public function editSection($hash, $json = false)
    {
        $this->theme = 'Realconnex';
        $this->autoRender = false;
        $decryptListener = $this->decryptSection($hash);
        $parse = explode('.', $decryptListener);
        if (count($parse) > 1) {
            $listener = $parse[0] . 'Listener';
            App::uses($listener, 'Listeners/Sections');
            $this->getEventManager()->attach(new $listener($this));
            $section = new CakeEvent($decryptListener, $this, array(
                'data' => $this->request->data ? $this->request->data : $this->request->query,
                'json' => $json
            ));
            $this->getEventManager()->dispatch($section);
            if (!$section->isStopped()) {
                $this->ajaxResponse['result'] = $section->result;
            } else {
                $this->ajaxResponse['errorDesc'] = $section->result['errors'];
            }
        } else {
            $this->ajaxResponse['errorDesc'] = 'Incorrect data!';
        }
        if (!$json) {
            $this->sendAjax();
        } else {
            return $this->ajaxResponse['result']['content'];
        }
    }

    public function folderPrefix($salt = null)
    {
        $salt = (empty($salt)) ? $this->currentUserID : $salt;
        return substr(md5($this->Auth->user('email') . $salt), 0, 8);
    }

    public function decryptSection($hash, $secretKey = 'ReAlC0n', $isArray = false)
    {
        $iv = substr(hash('sha256', 'Re@lC0n'), 0, 16);
        $data = openssl_decrypt(strtr($hash, '-_,', '+/='), 'AES-128-CFB', $secretKey, false, $iv);
        return $isArray ? json_decode($data, true) : $data;
    }

    public function encryptSection($data, $secretKey = 'ReAlC0n', $isArray = false)
    {
        $iv = substr(hash('sha256', 'Re@lC0n'), 0, 16);
        $data = $isArray ? json_encode($data) : $data;
        return strtr(openssl_encrypt($data, 'AES-128-CFB', $secretKey, false, $iv), '+/=', '-_,');
    }

    public function flashMsg($msg, $type = 'success', $options = array('delay' => 3000, 'position' => 'center'))
    {
        $params = array();
        $allowed = array('success' => 'success', 'error' => 'danger');
        $params['type'] = (array_key_exists($type, $allowed)) ? $allowed[$type] : 'success';
        $params = array_merge($params, $options ?: array());
        $this->Session->setFlash($msg, 'pnotify', $params);
    }

    public function isAuthorized($user)
    {
        return $this->SimpleAuth->isAuth($user);
    }

    public function generateLocalePrefix($ownerId, $entity, $projectTypeId = null)
    {
        $this->set('localePrefix', $ownerId . $entity . $projectTypeId);
    }

    public function getNews()
    {
        if (!defined('_LOCAL_')) {
            $cacheName = 'theNewsFunnel_' . $this->currentUserID;
            if (!$news = Cache::read($cacheName, 'short')) {
                $API_KEY = '2bbe0c9b880d9a0a05fe913e1f7dec12';
                $USER_EMAIL = $this->Auth->user('email');
                $news = file_get_contents("http://www.thenewsfunnel.com/clientapi/rc/{$API_KEY}/{$USER_EMAIL}");
                Cache::write($cacheName, $news, 'short');
            }
            $this->set('news', $news);
        }
        return false;
    }

    protected function initConfig()
    {
        $this->set([
            'page'         => $this->page,
            'companyExist' => ClassRegistry::init('Company')->checkExist($this->Session->read('Auth.User.id'))
        ]);
    }
}
