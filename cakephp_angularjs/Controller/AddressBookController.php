<?php
App::uses('AppController', 'Controller');

/**
 * AddressBookController Controller
 *
 * @property AddressGroup AddressGroup
 * @property Address      Address
 */
class AddressBookController extends AppController
{
//    public $uses = array('AddressGroup', 'Address', 'AddressesGroup');
    public $uses = array('AddressGroup', 'Address');

    public function index()
    {
        $projectsArr = array();
        $projectsArr[] = array('id' => -1, 'title' => 'Me');
        $projectsArr[] = array('id' => -2, 'title' => 'My Company');
        $projectsArr = array_merge($projectsArr, Set::extract('/Project/.', $this->Address->User->Project->find('all', array(
            'conditions' => array('user_id' => $this->currentUserID),
            'fields'     => array('id', 'title')
        ))));
        $companyId = Set::extract('Company.0.id', $this->Address->User->find('first', array(
            'conditions' => array('id' => $this->currentUserID),
            'contain'    => array('Company' => array('fields' => array('id')))
        )));
        $this->set(compact('projectsArr', 'companyId'));
    }

    public function repairContacts()
    {
        $contacts = $this->Address->find('all', array());
        $repairContacts = array();
        foreach ($contacts as $value) {
            if (!json_encode($value)) {
                // Clear non symbolic in fields
                array_walk($value, function (&$val) {
                    $val = preg_replace('/[^\x20-\x7E]/', '', $val);
                });
                $repairContacts[] = $value;
            }
        }
        if ($this->Address->saveMany($repairContacts)) {
            echo '<pre>';
            print_r($repairContacts);
            echo '</pre>';
        } else {
            echo 'Error!';
        }
        exit();
    }

    public function getAllContacts()
    {
        $contacts = $this->Address->find('all', array(
            'conditions' => array('user_id' => $this->currentUserID)
        ));
        $groups = $this->AddressGroup->find('all', array(
            'contain'    => array('Address' => array('fields' => 'Address.*')),
            'conditions' => array('AddressGroup.user_id' => $this->currentUserID),
            'recursive'  => -1
        ));
        $this->ajaxResponse['groups'] = $groups;
        $this->ajaxResponse['contacts'] = Set::extract('/Address/.', $contacts);
        $this->sendAjax();
    }

    public function getContacts()
    {
        $contacts = $this->Address->find('all', array(
            'conditions' => array('user_id' => $this->currentUserID)
        ));
        $this->ajaxResponse['contacts'] = Set::extract('/Address/.', $contacts);
        $this->sendAjax();
    }

    public function sendGroupMessage()
    {
        if ($this->request->data) {
            App::import('Component', 'Email');
            $this->Email = new CakeEmail('amazon');

            $receiverIds = Set::extract('/contacts/id', $this->request->data['MessageSystem']);
            $receiversArr = $this->Address->find('list', array(
                'fields'     => array('Address.id', 'Address.email'),
                'conditions' => array(
                    'Address.id'       => $receiverIds,
                    'Address.email !=' => null,
                )
            ));
            if ($receiversArr) {
                $message = $this->request->data['MessageSystem']['text'];
                $messageForSystem = $message;
                $this->Email
                    ->emailFormat('html')
                    ->from(array(Configure::read('mainEmail') => $this->Auth->user('full_name')))
                    ->subject($this->request->data['MessageSystem']['subject'])
                    ->replyTo($this->Auth->user('email'), $this->Auth->user('full_name'));

                if (!empty($this->request->data['MessageSystem']['files'])) {
                    if (isset($this->request->data['MessageSystem']['isEmbed']) && $this->request->data['MessageSystem']['isEmbed'] == 'true') {

                        foreach ($this->request->data['MessageSystem']['files'] as $file) {
                            static $i = 1;
                            $this->request->data['MessageSystem']['text'] .= '<br>';
                            $messageForSystem .= '<br>';
                            if (preg_match("/^.*\.(jpg|jpeg|png|gif)$/i", $file['fileName'])) {
                                $this->request->data['MessageSystem']['text'] .= "<img width='200px' src='{$file['fileUrl']}'/><br>";
                                $messageForSystem .= "<a href='{$file['fileUrl']}'><img width='200px' src='{$file['fileUrl']}'/></a><br>";
                            } else {
                                $this->request->data['MessageSystem']['text'] .= "$i - <a href='{$file['fileUrl']}'>{$file['fileName']}</a><br>";
                                $messageForSystem .= "$i - <a href='{$file['fileUrl']}'>{$file['fileName']}</a><br>";
                                $i++;
                            }
                        }
                    } else {
                        $this->request->data['MessageSystem']['text'] .= '<br><br>';
                        $this->request->data['MessageSystem']['text'] .= 'Attached Files:<br>';
                        $messageForSystem .= '<br><br>';
                        $messageForSystem .= 'Attached Files:<br>';
                        foreach ($this->request->data['MessageSystem']['files'] as $file) {
                            static $i = 1;
                            $this->request->data['MessageSystem']['text'] .= "$i - <a href='{$file['fileUrl']}'>{$file['fileName']}</a><br>";
                            $messageForSystem .= "$i - <a href='{$file['fileUrl']}'>{$file['fileName']}</a><br>";
                            $i++;
                        }
                    }

                }
                $User = ClassRegistry::init('User');
                $outSystemUsers = array();
                $systemUsers = array();

                $message = $this->request->data['MessageSystem']['text'];

                $systemEmails = [];
                $outSystemEmails = [];

                foreach ($receiversArr as $key => $receiver) {
                    $currentUser = $User->find('first', array(
                        'conditions' => array(
                            'email' => $receiver
                        ),
                        'fields'     => 'id'
                    ));
                    if ($currentUser) {
                        $systemUsers[] = $currentUser['User']['id'];
                        $systemEmails[] = $receiver;
                    } else {
                        $outSystemUsers[] = $key;
                        $outSystemEmails[] = $receiver;
                    }
                }
                $systemUserMessages = [];
                $outSysMessages = [];
                if ($systemEmails) {
                    foreach ($systemEmails as $key => $systemEmail) {
                        $systemUserMessages[$key]['sender_full_name'] = $this->Auth->user('full_name');
                        $systemUserMessages[$key]['sender_email']     = $this->Auth->user('email');
                        $systemUserMessages[$key]['to_email']         = $systemEmail;
                        $systemUserMessages[$key]['message']          = $message;
                        $systemUserMessages[$key]['subject']          = $this->request->data['MessageSystem']['subject'];
                    }

//                    $this->Email->bcc($systemEmails);
//                    $this->Email->send($message);
                }
                if ($outSystemEmails) {
                    foreach ($outSystemEmails as $key => $outSystemEmail) {
                        $outSysMessages[$key]['sender_full_name'] = $this->Auth->user('full_name');
                        $outSysMessages[$key]['sender_email']     = $this->Auth->user('email');
                        $outSysMessages[$key]['to_email'] = $outSystemEmail;
                        $outSysMessages[$key]['subject']          = $this->request->data['MessageSystem']['subject'];
                        $outSysMessages[$key]['message']  = $message .  '<br><br>This message is powered by RealConnex, the premiere on-line marketplace and professional network for real estate professionals. Click <a href="' . 'http://' . $_SERVER['HTTP_HOST'] . '">here</a> to sign up now for free!';;
                    }

//                    $message .= '<br><br>This message is powered by RealConnex, the premiere on-line marketplace and professional network for real estate professionals. Click <a href="' . $_SERVER['HTTP_ORIGIN'] . '">here</a> to sign up now for free!';
//                    $this->Email->bcc($outSystemEmails);
//                    $this->Email->send($message);
                }
                if ($systemUserMessages) {
                    $saveArr = $systemUserMessages;
                }

                if ($outSysMessages) {
                    $saveArr =isset($saveArr)? array_merge($saveArr, $outSysMessages) : $outSysMessages;
                }

                $status  = ClassRegistry::init('EmailQueue')->saveAll($saveArr);
                                // run shell to send email queues
                $cmd = ROOT . DS . APP_DIR . DS . 'Console' . DS . 'cake' . ' email_sender';
                exec($cmd . " > /dev/null &");

                if ($systemUsers) {
                    $this->getEventManager()->dispatch(new CakeEvent('Message.send', $this, array(
                        'toId'              => $systemUsers,
                        'subject'           => $this->request->data['MessageSystem']['subject'],
                        'message'           => $messageForSystem,
                        'saveOnly'          => true,
                        'from_address_book' => false,
                    )));
                }

                if ($outSystemUsers) {
                    $this->getEventManager()->dispatch(new CakeEvent('Message.send', $this, array(
                        'toId'              => $outSystemUsers,
                        'subject'           => $this->request->data['MessageSystem']['subject'],
                        'message'           => $messageForSystem,
                        'saveOnly'          => true,
                        'from_address_book' => true,
                    )));
                }


            } else {
                $this->ajaxResponse['errorDesc'] = 'Selected user has no email...';
            }
        } else {
            $this->ajaxResponse['errorDesc'] = 'Data is incorrect';
        }

        $this->sendAjax();
    }

    public function editContact()
    {
        $this->Address->contain(array('AddressGroup'));

        if ($this->request->data) {
            $this->request->data[$this->Address->alias]['user_id'] = $this->currentUserID;
            if (!$this->Address->save($this->request->data)) {
                $this->ajaxResponse['errorDesc'] = 'Data not saved, please try again...';
            } elseif (!isset($this->request->data['Address']['id'])) {
                $this->ajaxResponse['newContactId'] = $this->Address->id;
            }
        }
        $this->sendAjax();
    }

    public function deleteContacts()
    {
        if ($this->request->data) {
            $condition = array(
                'Address.id' => $this->request->data['contactIds']
            );

            if (!$this->Address->deleteAll($condition)) {
                $this->ajaxResponse['error'] = true;
                $this->ajaxResponse['errorDesc'] = 'Contacts not deleted';
            }
        }
        $this->sendAjax();
    }

    public function addGroup()
    {
        $data = $this->request->data;
        $data['AddressGroup']['user_id'] = $this->currentUserID;
        if ($res = $this->AddressGroup->save($data)) {
            $this->ajaxResponse['AddressGroup'] = $res['AddressGroup'];
        } else {
            $this->ajaxResponse['errorDesc'] = 'Group not created...';
        }

        $this->sendAjax();
    }

    public function editGroup()
    {
        if (!isset($this->request->data['Address'])) {
            $this->request->data['Address'] = array(null);
        }
        $result = $this->AddressGroup->save($this->request->data);
        if (!$result) {
            $this->ajaxResponse['errorDesc'] = 'Group not edited...';
        }
        $this->sendAjax();
    }

    public function deleteGroup()
    {
        if (!$this->AddressGroup->delete($this->request->data['id'])) {
            $this->ajaxResponse['errorDesc'] = 'Group not deleted...';
        }
        $this->sendAjax();
    }

    public function importContacts()
    {

        if ($this->request->data) {
            $event = new CakeEvent('User.contacts.get', $this, $this->request->data);
            $this->getEventManager()->dispatch($event);
            if (!$event->isStopped()) {
                if (!empty ($event->result['contacts'])) {
                    $this->ajaxResponse['contacts'] = $event->result['contacts'];
                } else {
                    $this->ajaxResponse['errorDesc'] = $event->result['errorDesc'];
                }
            } else {
                $this->ajaxResponse['errorDesc'] = $event->result['errorDesc'] ? $event->result['errorDesc'] : 'Wrong login data';
            }
        }

        $this->sendAjax();
    }

    public function addFromSystem($userID = null)
    {
        if ($this->request->is('get')) {
            if ($userData = $this->Address->User->read(null, $userID)) {
                $this->Address->save(array(
                    'user_id'    => $this->currentUserID,
                    'first_name' => $userData['User']['first_name'],
                    'last_name'  => $userData['User']['last_name'],
                    'job_title'  => $userData['User']['job_title'],
                    'photo'      => $userData['User']['avatar'],
                    'address'    => $userData['User']['address'],
                    'phone'      => $userData['User']['phone'],
                    'email'      => $userData['User']['email'],
                ));
            }
        } elseif ($this->request->is('post')) {
            $groupId = isset($this->request->data['groupId']) ? $this->request->data['groupId'] : -1;
            $entityId = $this->request->data['entityId'];
            switch ($entityId) {
                case Entity::MEMBER:
                    $data = $this->Address->User->read(null, $this->request->data['userId']);
                    $data = current(Set::extract('/User/.', $data));
                    break;
                case Entity::COMPANY:
                    $data = $this->Address->User->Company->read(null, $this->request->data['companyId']);
                    $data = current(Set::extract('/Company/.', $data));
                    break;
                case Entity::PROJECT:
                    $data = $this->Address->User->Project->read(null, $this->request->data['projectId']);
                    $data = current(Set::extract('/Project/.', $data));
                    $data['email'] = $data['contact_email'];
                    break;
            }

            $address = $this->Address->find('first', array(
                'contain'    => array('AddressGroup'),
                'conditions' => array(
                    'user_id'   => $this->currentUserID,
                    'entity_id' => $entityId,
                    'email'     => $data['email']
                )));

            if (count($address)) {
                if ($groupId > 0) {
                    // Add/remove from network
                    $addressOwnGroupIds = Set::extract('/AddressGroup/id', $address);
                    if ($this->request->data['action'] == 'add') {
                        $addressOwnGroupIds[] = $groupId;
                    } elseif ($this->request->data['action'] == 'delete') {
                        $key = array_search($groupId, $addressOwnGroupIds);
                        unset($addressOwnGroupIds[$key]);
                    }
                } else {
                    $addressOwnGroupIds = array();
                }

                $address['AddressGroup'] = count($addressOwnGroupIds) > 0 ? $addressOwnGroupIds : array(null);
                $this->Address->save($address);
            } else {
                // Create address and add it to group
                switch ($entityId) {
                    case Entity::MEMBER:
                        $this->Address->save(array(
                            'Address'      => array(
                                'user_id'    => $this->currentUserID,
                                'entity_id'  => $entityId,
                                'first_name' => $data['first_name'],
                                'last_name'  => $data['last_name'],
                                'job_title'  => $data['job_title'],
                                'photo'      => $data['avatar'],
                                'address'    => $data['address'],
                                'phone'      => $data['phone'],
                                'email'      => $data['email'],
                            ),
                            'AddressGroup' => $groupId > 0 ? array($this->request->data['groupId']) : array(null),
                        ));
                        break;
                    case Entity::COMPANY:
                        $this->Address->save(array(
                            'Address'      => array(
                                'user_id'   => $this->currentUserID,
                                'entity_id' => $entityId,
                                'last_name' => $data['title'],
                                'photo'     => '/thumbs/189x189' . $data['image'],
                                'phone'     => $data['phone'],
                                'email'     => $data['email'],
                                'url'       => $data['site'],
                            ),
                            'AddressGroup' => $groupId > 0 ? array($this->request->data['groupId']) : array(null),
                        ));
                        break;
                    case Entity::PROJECT:
                        $entityId = $entityId;
                        $this->Address->save(array(
                            'Address'      => array(
                                'user_id'   => $this->currentUserID,
                                'entity_id' => $entityId,
                                'last_name' => $data['title'],
                                'photo'     => '/thumbs/189x189' . $data['logo'],
                                'address'   => $data['location_txt'],
                                'phone'     => $data['phone'],
                                'email'     => $data['contact_email'],
                                'url'       => $data['email'],
                            ),
                            'AddressGroup' => $groupId > 0 ? array($this->request->data['groupId']) : array(null),
                        ));
                        break;
                }
            }
        }
        $this->sendAjax();
    }

    public function saveImport()
    {
        if ($this->request->data) {
            foreach ($this->request->data as &$contact) {
                $contact['user_id'] = $this->currentUserID;
            }

            if ($this->Address->saveMany($this->request->data)) {
                $this->sendAjax();
            }
        }
    }

    public function inviteContacts()
    {
        if ($this->request->data) {
            $this->Email = new CakeEmail('amazon');
            $this->Email
                ->emailFormat('html')
                ->from(array(Configure::read('mainEmail') => $this->Auth->user('full_name')))
                ->replyTo($this->Auth->user('email'), $this->Auth->user('full_name'))
                ->subject('You’ve been invited by ' . $this->Auth->user('full_name') . ' to join RealConnex, the premiere on-line marketplace and professional network for real estate professionals');

            $invitationMessage = $this->Auth->user('full_name') . ' has invited you to join RealConnex, an on-line
                marketplace and professional network for real estate professionals.
                <a href="' . $_SERVER['HTTP_ORIGIN'] . '">Click here</a> to sign up now for free! <br/><br/>
                <a href="' . $_SERVER['HTTP_ORIGIN'] . '">Join now</a> to :<br/>
                <ul>
                    <li>Secure capital for funds and deals</li>
                    <li>Identify early emerging deal and service opportunities</li>
                    <li>Identify qualified and verified service providers across wide geographies</li>
                    <li>Gain access to powerful business development tools to cut costs of prospecting and finding new
                    deals.</li>
                </ul>';

            foreach ($this->request->data as $contact) {
                $this->Email->to($contact['email']);
                $this->Email->send($invitationMessage);
            }

            $this->sendAjax();
        }
    }

    public function uploadPhoto()
    {
        $file = (isset($this->request->params['form']['file'])) ? $this->request->params['form']['file'] : null;
        /**
         * @var ImageComponent $Image
         */
        $Image = $this->Components->load('Image');
        $dirToPhotos = DS . 'uploads' . DS . 'addressBook_' . $this->folderPrefix();
        $photo = $Image->uploadPhoto($file, $dirToPhotos);
        if (empty($photo['error'])) {
            $this->ajaxResponse['photo'] = $photo['pathToPhoto'];
            $this->ajaxResponse['filename'] = $photo['onlyFilename'];
        } else {
            $this->ajaxResponse['errorDesc'] = $photo['error'];
        }

        $this->sendAjax();
    }

    public function uploadImage()
    {
        $upload = $this->Components->load('Upload');
        $upload->initialize($this);
        $upload->start();
    }

    public function uploadFile()
    {
        $file = (isset($this->request->params['form']['file'])) ? $this->request->params['form']['file'] : null;
        /**
         * @var ImageComponent $Image
         */
        $Image = $this->Components->load('Image');
        $dirToPhotos = DS . 'uploads' . DS . 'addressBookFiles_' . $this->folderPrefix();
        $photo = $Image->uploadPhoto($file, $dirToPhotos, $Image::FILE, $Image::REAL_NAME);
        if (empty($photo['error'])) {
            $this->ajaxResponse['url'] = Router::fullBaseUrl() . $photo['pathToPhoto'];
            $this->ajaxResponse['filename'] = $photo['onlyFilename'];
            $this->ajaxResponse['pathToFile'] = $photo['pathToPhoto'];
        } else {
            $this->ajaxResponse['errorDesc'] = $photo['error'];
        }

        $this->sendAjax();
    }
}
